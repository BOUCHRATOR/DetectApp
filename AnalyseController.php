<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
class AnalyseController extends Controller
{
    public function analyse(Request $request){
    try{
                    $Image=$request->validate([
                    'chemin'=>'string'
                ]);
                
                $cleanBase64 = preg_replace('/[^A-Za-z0-9+\/=]/', '', $Image['chemin']);
                  $imageData = base64_decode($cleanBase64,true);
                  if ($imageData === false) {
                throw new \Exception("Encodage base64 invalide");
            }
         
                        $pythonResponse = Http::withOptions([
                'verify' => false,
                'timeout' => 30
            ])->post('http://127.0.0.1:5000/process', [
                'chemin' => $cleanBase64
            ]);
                         if ($pythonResponse->status() === 400) {
            $errorDetails = $pythonResponse->json() ?? ['error' => 'Bad Request'];
            throw new \Exception("Erreur de traitement Python: " . json_encode($errorDetails));
        }
                   
                         $userid=Auth::id();
                           if ($pythonResponse->successful()) {
                                $reponse = $pythonResponse->json();
                                
                                
                                // Valider la réponse Python
                                if (!isset($reponse['diagnostic']) || !isset($reponse['probabilite'])) {
                                    return response()->json([
                                        'status' => 'error',
                                        'message' => 'Réponse Python incomplète'
                                    ], 400);
                                }
                             
                                // Insérer et récupérer l'ID
                                $analyseId = DB::table('analyses')->insertGetId([
                                    'client_id' => $userid,
                                    'date_analyse' => now(),
                                    'chemin' => $cleanBase64,
                                    'NomMalade' => $reponse['diagnostic'] ?? 'Inconnu',
                                    'taux' => $reponse['probabilite'] ?? 0,
                                ]);
                                DB::table('historiques')->insert([
                                    'analyse_id'=>$analyseId
                                ]);
                               $medid=DB::table('medicaments')
                               ->where('malade',$reponse['diagnostic'])
                               ->where('taux','<=',(float)$reponse['probabilite'])
                               ->orderByDesc('taux')
                               ->first();
                               if ($medid) {
                                        DB::table('prescriptions')->insert([
                                                                    'analyse_id'=>$analyseId,
                                                                    'medicament_id'=>$medid->id
                                                                ]);
                                    } else {
                                        return response()->json([
                                            'erreur' => 'donne ne stocker pas avec succes',
                                            'error'  => 'Aucun médicament trouvé'
                                        ]);
                                    }
                              
                                // Récupérer l'analyse complète
                                

                            } else {
                                return response()->json([
                                    'status' => 'error',
                                    'message' => "Erreur Python: " . $pythonResponse->status()
                                ], $pythonResponse->status());
                            }
 
                             return response()->json(['user_id' => $userid]);
    }
catch(\Exception $e ){
     return response()->json([
            'erreur' => 'donne ne stocker pas avec succes',
             'error'=>$e->getMessage(),
        ]);
}
}

 private function sanitizeBase64($data): string
    {
        // Supprime tous les caractères non-base64
        $cleaned = preg_replace('/[^A-Za-z0-9+\/=]/', '', $data);
        
        // Complète le padding si nécessaire
        $padding = strlen($cleaned) % 4;
        if ($padding > 0) {
            $cleaned .= str_repeat('=', 4 - $padding);
        }
        
        return $cleaned;
    }

    /**
     * Tronque le base64 pour la base de données
     */
    private function truncateBase64($data, $length = 512): string
    {
        return substr($data, 0, $length);
    }
}