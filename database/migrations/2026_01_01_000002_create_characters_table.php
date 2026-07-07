<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('characters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_manga_id')->constrained('project_mangas')->onDelete('cascade');
            $table->string('nama');
            $table->string('peran');
            $table->text('profil_detail'); // usia, hobi, trauma, motivasi
            $table->string('desain_visual_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('characters');
    }
};
