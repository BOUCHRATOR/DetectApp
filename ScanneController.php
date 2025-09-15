<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use App\Models\User; 
class ScanneController extends Controller
{
    public function fatial(Request $request){
        if (!$request->hasFile('image')) {
            return response()->json(['error' => 'Image non reçue'], 400);
        }
        
        // Charger les utilisateurs avec images en base64
        $Datauser = DB::table('utilisateurs')
            ->select('id','profile','prenom','nom')
            ->get()
            ->map(function($user){
                if($user->profile) {
                    $profilePath = storage_path('app/public/profiles/' . basename($user->profile));
                    if (file_exists($profilePath)) {
                        // Convertir l'image en base64
                        $imageData = file_get_contents($profilePath);
                        $user->profile = base64_encode($imageData);
                    } else {
                        $user->profile = null;
                    }
                } else {
                    $user->profile = null;
                }
                return (array) $user;
            })->toArray();

        // Convertir l'image uploadée en base64
        $uploadedImage = $request->file('image');
        $uploadedImageBase64 = base64_encode(file_get_contents($uploadedImage->getRealPath()));

        $pythonResponse = Http::withOptions([
            'verify' => false,
            'timeout' => 60  // Augmentez le timeout
        ])->withHeaders([
            'Content-Type' => 'application/json'
        ])->post('http://127.0.0.1:5000/scanne', [
            'datausers' => $Datauser,
            'scanned_image_base64' => $uploadedImageBase64
        ]);

        if ($pythonResponse->successful()) {
            $reponse = $pythonResponse->json(); 
            if (!isset($reponse['id']) || !isset($reponse['nom']) || !isset($reponse['prenom'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Réponse Python incomplète'
                ], 400);
            }
            $user = User::where('id',$reponse['id'])->first();
             $userExists = collect($Datauser)->contains('id', $reponse['id']);
            $userProfile = DB::table('utilisateurs')
            ->where('id', $reponse['id'])
            ->value('profile');
            if ($userExists ) {
                //$token = $user->createToken('facial-auth')->plainTextToken;
                Auth::login($user); 
                $request->session()->regenerate();
                return response()->json([
                    'id' => $reponse['id'],
                    'nom' => $reponse['nom'],
                    'prenom' => $reponse['prenom'],
                    'profile'=>$userProfile,
                      // ← Indiquer la redirection
                    'status' => 'success'
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Utilisateur non reconnu'
                ], 404);
            }
              
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur Python: ' . $pythonResponse->body()
            ], 500);
        }
    }
}