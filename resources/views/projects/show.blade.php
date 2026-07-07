@extends('layouts.app')

@section('title', $project->judul . ' - MangaStudio')

@section('content')
<div class="flex flex-col h-full bg-gray-50" x-data="{ activeTab: 'kosei' }">
    <!-- Header Area -->
    <div class="bg-white border-b border-gray-200 px-8 py-6">
        <a href="{{ route('projects.index') }}" class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4">
            &larr; Back to Dashboard
        </a>
        
        <div class="flex justify-between items-end">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 tracking-tight mb-2">{{ $project->judul }}</h1>
                <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-500">{{ $project->tema }}</span>
                    <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span class="text-sm font-medium text-gray-700 capitalize">{{ $project->target_pasar }}</span>
                </div>
            </div>
            <div class="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-100">
                {{ $project->status }}
            </div>
        </div>

        <!-- Tab Navigation -->
        <div class="flex gap-6 mt-8 -mb-6">
            <button @click="activeTab = 'kosei'" :class="{'border-blue-600 text-blue-600': activeTab === 'kosei', 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'kosei'}" class="flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors">
                Kosei & Cerita
            </button>
            <button @click="activeTab = 'character'" :class="{'border-blue-600 text-blue-600': activeTab === 'character', 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'character'}" class="flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors">
                Character Sheet
            </button>
            <button @click="activeTab = 'storyboard'" :class="{'border-blue-600 text-blue-600': activeTab === 'storyboard', 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'storyboard'}" class="flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors">
                Storyboard / Nemu
            </button>
            <button @click="activeTab = 'reference'" :class="{'border-blue-600 text-blue-600': activeTab === 'reference', 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'reference'}" class="flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors">
                Referensi / Shiryo
            </button>
        </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-auto p-8">
        <div class="max-w-4xl mx-auto">
            
            <!-- Kosei & Cerita Tab -->
            <div x-show="activeTab === 'kosei'" x-cloak class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                @include('projects.partials.tab-kosei')
            </div>

            <!-- Character Sheet Tab -->
            <div x-show="activeTab === 'character'" x-cloak class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                @include('projects.partials.tab-character')
            </div>

            <!-- Storyboard Tab -->
            <div x-show="activeTab === 'storyboard'" x-cloak class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                @include('projects.partials.tab-storyboard')
            </div>

            <!-- Reference Tab -->
            <div x-show="activeTab === 'reference'" x-cloak class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                @include('projects.partials.tab-reference')
            </div>

        </div>
    </div>
</div>

<!-- Menggunakan Alpine.js untuk tab sederhana -->
@push('scripts')
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
@endpush
@endsection
