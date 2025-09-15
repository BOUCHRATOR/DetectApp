<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
class SolutionController extends Controller
{
    public function solution($analyseId){
       
        if($analyseId){
        $solution=DB::table('prescriptions as p')
            ->join('medicaments as m', 'p.medicament_id', '=', 'm.id')
            ->select('m.*')
            ->where('p.analyse_id', $analyseId)
            ->get();
        }else{
            return response()->json([
                        'erreur' => 'analyseid est null',
                         'error'  => 'Aucun médicament trouvé'
                                        ]);
        }
      return response()->json([
    'status' => 'success',
    'solution' => $solution,
    'idanalyse'=>$analyseId
]);
    }}