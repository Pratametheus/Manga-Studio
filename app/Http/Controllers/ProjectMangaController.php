<?php

namespace App\Http\Controllers;

use App\Models\ProjectManga;
use Illuminate\Http\Request;

class ProjectMangaController extends Controller
{
    public function index()
    {
        $projects = ProjectManga::all();
        return view('projects.index', compact('projects'));
    }

    public function create()
    {
        // return view('projects.create');
    }

    public function store(Request $request)
    {
        // Validasi & Simpan
    }

    public function show(ProjectManga $projectManga)
    {
        // Eager load relasi untuk ditampilkan di Command Center
        $projectManga->load(['characters', 'storyboards', 'referenceShiryos']);
        return view('projects.show', ['project' => $projectManga]);
    }

    public function edit(ProjectManga $projectManga)
    {
        // return view('projects.edit', compact('projectManga'));
    }

    public function update(Request $request, ProjectManga $projectManga)
    {
        // Validasi & Update
    }

    public function destroy(ProjectManga $projectManga)
    {
        $projectManga->delete();
        return redirect()->route('projects.index');
    }
}
