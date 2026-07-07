<div>
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Storyboard / Nemu</h2>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm">
            + Tambah Bab
        </button>
    </div>

    <div class="space-y-4">
        @forelse($project->storyboards as $storyboard)
            @php
                $statusColors = [
                    'draf' => 'bg-gray-100 text-gray-700 border-gray-200',
                    'review_editor' => 'bg-amber-100 text-amber-800 border-amber-200',
                    'revisi' => 'bg-rose-100 text-rose-700 border-rose-200',
                    'disetujui' => 'bg-emerald-100 text-emerald-800 border-emerald-200',
                ];
                $colorClass = $statusColors[$storyboard->status_approval] ?? $statusColors['draf'];
            @endphp
            <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center group">
                <div class="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 text-blue-700 rounded-xl shrink-0 border border-blue-100">
                    <span class="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-0.5">Bab</span>
                    <span class="font-bold text-xl leading-none">{{ $storyboard->bab }}</span>
                </div>
                
                <div class="flex-1 w-full">
                    <div class="flex flex-wrap items-center gap-3 mb-3">
                        <span class="px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider {{ $colorClass }}">
                            {{ str_replace('_', ' ', $storyboard->status_approval) }}
                        </span>
                    </div>
                    
                    <div class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100 relative">
                        <span class="text-[10px] uppercase font-bold text-gray-400 absolute -top-2 left-3 bg-gray-50 px-1">Catatan Editor</span>
                        <p class="mt-1 line-clamp-2">
                            {{ $storyboard->catatan_pacing_layout ?: 'Belum ada catatan pacing atau layout.' }}
                        </p>
                    </div>
                </div>

                <div class="shrink-0 flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                     <button class="w-full md:w-auto px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors">
                        Lihat Draf
                     </button>
                </div>
            </div>
        @empty
            <div class="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <p class="text-gray-500 font-medium">Belum ada storyboard</p>
                <p class="text-gray-400 text-sm mt-1">Buat draf bab pertamamu sekarang.</p>
            </div>
        @endforelse
    </div>
</div>
