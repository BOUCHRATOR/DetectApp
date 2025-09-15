<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HistoryController extends Controller
{
    public function history()
    {
        $userid = Auth::id();
        
        if (!$userid) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        // Récupérer toutes les analyses de l'utilisateur
        $analyses = DB::table('analyses as a')
            ->join('historiques as h', 'h.analyse_id', '=', 'a.id')
            ->where('a.client_id', $userid)
            ->select('a.id as analyse_id', 'a.date_analyse', 'a.chemin','a.NomMalade','a.taux')
            ->get();

        // Pour chaque analyse, récupérer ses médicaments
        $history = $analyses->map(function($analyse) {
            $medicaments = DB::table('prescriptions as p')
                ->join('medicaments as m', 'p.medicament_id', '=', 'm.id')
                ->where('p.analyse_id', $analyse->analyse_id)
                ->select('m.nom')
                ->get();

            return [
                'analyse_id'  => $analyse->analyse_id,
                'date_analyse'=>$analyse->date_analyse,
                'chemin'=>$analyse->chemin,
                'NomMalade'=>$analyse->NomMalade,
                'taux'=>$analyse->taux,
                'medicaments' => $medicaments
            ];
        });

        return response()->json([
            'status' => 'success',
            'history' => $history
        ]);
    }
}
