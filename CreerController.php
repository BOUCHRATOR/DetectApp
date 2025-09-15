<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CreerController extends Controller
{
    public function creer(Request $request){
        $data = $request->validate([
            'email'   => 'required|email',
            'nom'     => 'required|string',
            'prenom'  => 'required|string',
            'ville'   => 'required|string',
            'date'    => 'required|date',
            'image'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'role'    => 'required|string',
            'tele'    => 'required|string',
            'motpss'  => 'required|min:4',
        ]);

        // 📌 Par défaut aucune image
        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('profiles', 'public');
        }

        DB::table('utilisateurs')->insert([
            'role'      => $data['role'],
            'nom'       => $data['nom'],
            'prenom'    => $data['prenom'],
            'email'     => $data['email'],
            // ⚠️ Toujours hasher le mot de passe !
            'password'  => $data['motpss'],
            'adresse'   => $data['ville'],
            'date'      => $data['date'],
            'telephone' => $data['tele'],
            'profile'   => $imagePath, // peut être null
        ]);

        return response()->json([
            'success' => true,
            'status'  => 'Données bien stockées ✅',
            
        ]);
    }
}
