<div>
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Referensi & Shiryo</h2>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm">
            + Upload Referensi
        </button>
    </div>

    <!-- Masonry-like layout using CSS columns -->
    <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        @forelse($project->referenceShiryos as $ref)
            @php
                $catColors = [
                    'lokasi' => 'bg-emerald-500 text-white',
                    'arsitektur' => 'bg-indigo-500 text-white',
                    'pakaian' => 'bg-amber-500 text-white',
                    'pose' => 'bg-rose-500 text-white',
                ];
                $badgeColor = $catColors[$ref->kategori] ?? 'bg-gray-500 text-white';
            @endphp
            <div class="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 bg-white">
                @if($ref->foto_path)
                    <img src="{{ asset('storage/' . $ref->foto_path) }}" alt="{{ $ref->keterangan }}" class="w-full h-auto object-cover">
                @else
                    <div class="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                @endif
                
                <!-- Badge -->
                <div class="absolute top-3 right-3">
                    <span class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm {{ $badgeColor }}">
                        {{ $ref->kategori }}
                    </span>
                </div>
                
                <!-- Hover Overlay -->
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p class="text-white text-sm font-medium line-clamp-2">{{ $ref->keterangan }}</p>
                </div>
                
                <!-- Fallback caption if no hover -->
                <div class="p-3 bg-white block group-hover:hidden border-t border-gray-100">
                     <p class="text-gray-700 text-sm font-medium truncate">{{ $ref->keterangan }}</p>
                </div>
            </div>
        @empty
            <div class="break-inside-avoid col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white w-full">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <p class="text-gray-500 font-medium">Belum ada referensi</p>
                <p class="text-gray-400 text-sm mt-1">Kumpulkan gambar referensi di sini.</p>
            </div>
        @endforelse
    </div>
</div>
