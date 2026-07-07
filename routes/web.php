<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectMangaController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\StoryboardController;
use App\Http\Controllers\ReferenceShiryoController;

Route::get('/', function () {
    return redirect()->route('projects.index');
});

Route::resource('projects', ProjectMangaController::class);
Route::resource('characters', CharacterController::class);
Route::resource('storyboards', StoryboardController::class);
Route::resource('references', ReferenceShiryoController::class);
