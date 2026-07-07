<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Storyboard extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_manga_id',
        'bab',
        'draf_kasar_path',
        'catatan_pacing_layout',
        'status_approval'
    ];

    public function projectManga()
    {
        return $this->belongsTo(ProjectManga::class);
    }
}
