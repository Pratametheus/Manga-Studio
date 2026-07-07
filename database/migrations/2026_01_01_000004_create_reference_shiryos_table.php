<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reference_shiryos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_manga_id')->constrained('project_mangas')->onDelete('cascade');
            $table->enum('kategori', ['lokasi', 'arsitektur', 'pakaian', 'pose']);
            $table->string('keterangan');
            $table->string('foto_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reference_shiryos');
    }
};
