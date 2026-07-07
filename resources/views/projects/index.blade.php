@extends('layouts.app')

@section('title', 'Projects - MangaStudio')

@section('content')
<div class="p-8 max-w-7xl mx-auto w-full">
    <div class="mb-8 flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">Active Projects</h2>
            <p class="text-gray-500 mt-1">Manage your manga pre-production pipeline.</p>
        </div>
        <a href="{{ route('projects.create') }}" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm">
            + New Project
        </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($projects as $project)
            <!-- Helper untuk warna badge target pasar -->
            @php
                $badgeColors = [
                    'shonen' => 'bg-orange-100 text-orange-700 border-orange-200',
                    'shojo'  => 'bg-pink-100 text-pink-700 border-pink-200',
                    'seinen' => 'bg-blue-100 text-blue-800 border-blue-200',
                    'josei'  => 'bg-purple-100 text-purple-700 border-purple-200',
                ];
                $color = $badgeColors[$project->target_pasar] ?? 'bg-gray-100 text-gray-700 border-gray-200';
            @endphp

            <a href="{{ route('projects.show', $project->id) }}" class="block bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 flex flex-col h-full group cursor-pointer">
                <div class="flex justify-between items-start mb-4 gap-4">
                    <h3 class="font-semibold text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {{ $project->judul }}
                    </h3>
                    <span class="px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap {{ $color }}">
                        {{ strtoupper($project->target_pasar) }}
                    </span>
                </div>
                
                <p class="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
                    {{ $project->logline }}
                </p>

                <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span class="text-xs font-medium text-gray-600 uppercase tracking-wider">{{ $project->status }}</span>
                    </div>
                    <span class="text-xs text-gray-400 font-medium">{{ $project->tema }}</span>
                </div>
            </a>
        @endforeach
    </div>
</div>
@endsection
