<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_mangas', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->string('logline');
            $table->string('tema');
            $table->enum('target_pasar', ['shonen', 'shojo', 'seinen', 'josei']);
            $table->text('sinopsis_lengkap');
            $table->text('world_building');
            $table->string('status');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_mangas');
    }
};
