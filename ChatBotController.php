<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
class ChatBotController extends Controller
{
    public function chatbot(Request $request){
        
        $userid=Auth::id();
          $message=$request->validate([
            'message' => 'required|string',
          ]);
         $question = strtolower($message['message']);
          if(!$question){
             return response()->json([
                'success' => false,
                'message' => 'vide'
            ], 404);
          }
            $response = Http::post('http://localhost:5000/generate', ['question' => $question]);
            
                if ($response->failed() || !isset($response->json()['answer'])) {
                    return response()->json([
                        'status' => 'error',
                        'reponse' => 'Le service NLP ne répond pas correctement.'
                    ], 500);
    }
            $generatedResponse = $response->json()['answer'];
             if($generatedResponse){
              DB::table('chats')->insert([
                  'user_id'=>$userid,
                  'message'=>$question,
                  'response'=>$generatedResponse,
                  'date'=>date('Y-m-d')
              ]);
            return response()->json([
        'status' => 'success',
        'question' => $question,
        'reponse' => $generatedResponse,
    ]);
          }else {
           return response()->json([
               'erreur' => 'donne ne stocker pas avec succes',
                'error'  => 'Aucun reponse trouvé'
                  ]);
           }
          
    }}