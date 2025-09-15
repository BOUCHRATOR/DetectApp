<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
class FetchchatController extends Controller
{
    public function fetchchats(Request $request){
        $userid=Auth::id();
        $allchats=DB::table('chats')->select('message','response','date')->where('user_id',$userid)->get();
            return response()->json([
                                    'status' => 'success',
                                    'allchats' => $allchats,
                                    'user_id' => $userid,
                                    
                                ]);
    }}
