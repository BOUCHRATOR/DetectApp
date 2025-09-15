<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\DataController;
use App\Http\Controllers\AnalyseController;
use App\Http\Controllers\GetAnalyseController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\SolutionController;
use App\Http\Controllers\DeconnexionController;
use App\Http\Controllers\CreerController;
use App\Http\Controllers\ScanneController;
use App\Http\Controllers\ChatBotController;
use App\Http\Controllers\FetchchatController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/user', function (Request $request) {
//         return $request->user();
//     });
    

// });

Route::middleware(['web', 'auth'])->group(function () {
  
    Route::match(['get', 'post'], '/analyse', [AnalyseController::class,'analyse']);
    Route::match(['get', 'post'], '/chatbot', [ChatBotController::class,'chatbot']);
    Route::get( '/GetAnalyse', [GetAnalyseController::class,'GetAnalyse']);
    Route::get( '/history', [HistoryController::class,'history']);
    Route::get( '/solution/{analyseId}', [SolutionController::class,'solution']);
    Route::get( '/fetchchats', [FetchchatController::class,'fetchchats']);
});
Route::post('/logout', [DeconnexionController::class,'logout'])->name('logout');
Route::match(['get', 'post'], '/login', [DataController::class,'login'])->name('login');
  Route::match(['get', 'post'], '/creer', [CreerController::class,'creer']);
   Route::match(['get', 'post'], '/fatial', [ScanneController::class,'fatial']);
 
