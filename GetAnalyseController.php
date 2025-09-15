<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
class GetAnalyseController extends Controller
{
    public function GetAnalyse(Request $request){
        $userid=Auth::id();
        $newanalyse = DB::table('analyses')->where('client_id',$userid) ->latest('id') ->first();
        if (!$userid) {
        return response()->json([
            'status' => 'error',
            'message' => 'Utilisateur non authentifié'
        ], 401);
    }

                              
                                return response()->json([
                                    'status' => 'success',
                                    'analyse' => $newanalyse,
                                    'user_id' => $userid,
                                    'idanalyse'=>$newanalyse->id
                                ]);
    }
}