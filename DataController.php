<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use App\Models\User; 
class DataController extends Controller
{
    public function login(Request $request)
    {
        $datarecu = $request->validate([
            'email' => 'required|email',
            'pass' => 'required|min:4'
        ]);
     
       $user = User::where('email', $datarecu['email'])->first();

   
        if(!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 404);
        }
        
        if($datarecu['pass'] !== $user->password) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password'
            ], 401);
        } 
       Auth::login($user); 
      
        $request->session()->regenerate();
     // Session::put('id',Auth::id());
       
        return response()->json([
            'success' => true, // Fixed typo (was 'succes')
            'prenom' => $user->prenom,
             'nom'=>$user->nom,
             'profile'=>$user->profile
           // 'id' =>  session('id') // Optional: return session info
        ]);
       
    }

     
}