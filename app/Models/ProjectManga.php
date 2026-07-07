<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectManga extends Model
{
    use HasFactory;

    protected $fillable = [
        'judul',
        'logline',
        'tema',
        'target_pasar',
        'sinopsis_lengkap',
        'world_building',
        'status'
    ];

    public function characters()
    {
        return $this->hasMany(Character::class);
    }

    public function storyboards()
    {
        return $this->hasMany(Storyboard::class);
    }

    public function referenceShiryos()
    {
        return $this->hasMany(ReferenceShiryo::class);
    }
}
