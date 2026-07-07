<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferenceShiryo extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_manga_id',
        'kategori',
        'keterangan',
        'foto_path'
    ];

    public function projectManga()
    {
        return $this->belongsTo(ProjectManga::class);
    }
}
