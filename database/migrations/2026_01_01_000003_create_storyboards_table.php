<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storyboards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_manga_id')->constrained('project_mangas')->onDelete('cascade');
            $table->integer('bab');
            $table->string('draf_kasar_path')->nullable();
            $table->text('catatan_pacing_layout')->nullable();
            $table->enum('status_approval', ['draf', 'review_editor', 'revisi', 'disetujui'])->default('draf');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storyboards');
    }
};
