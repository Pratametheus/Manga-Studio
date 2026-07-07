<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Character extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_manga_id',
        'nama',
        'peran',
        'profil_detail',
        'desain_visual_path'
    ];

    public function projectManga()
    {
        return $this->belongsTo(ProjectManga::class);
    }
}
