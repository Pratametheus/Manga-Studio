<div>
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Character Sheet</h2>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm">
            + Upload Karakter
        </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        @forelse($project->characters as $character)
            <div class="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div class="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-4 relative">
                    @if($character->desain_visual_path)
                        <img src="{{ asset('storage/' . $character->desain_visual_path) }}" alt="{{ $character->nama }}" class="w-full h-full object-cover">
                    @else
                        <div class="w-full h-full flex items-center justify-center text-gray-400">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                    @endif
                </div>
                <div class="px-1 flex-1 flex flex-col">
                    <div class="flex justify-between items-start mb-1">
                        <h3 class="font-semibold text-gray-900 truncate pr-2">{{ $character->nama }}</h3>
                        <!-- Asumsi ada parsing dari profil_detail, untuk mockup pakai badge statis / placeholder -->
                        <span class="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider shrink-0 border border-gray-200">
                            Usia ??
                        </span>
                    </div>
                    <p class="text-sm text-gray-500 mb-4 line-clamp-1">{{ $character->peran }}</p>
                    <button class="mt-auto w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                        Lihat Detail Profil
                    </button>
                </div>
            </div>
        @empty
            <div class="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"></path></svg>
                <p class="text-gray-500 font-medium">Belum ada karakter</p>
                <p class="text-gray-400 text-sm mt-1">Mulai tambahkan karakter untuk project ini.</p>
            </div>
        @endforelse
    </div>
</div>
