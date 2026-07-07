<div class="max-w-3xl mx-auto space-y-12">
    <!-- Sinopsis -->
    <article class="prose prose-slate max-w-none">
        <h2 class="font-serif text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">Sinopsis Lengkap</h2>
        <div class="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap font-sans">
{{ $project->sinopsis_lengkap ?: 'Belum ada sinopsis. Mulai tulis ceritamu di sini...' }}</div>
    </article>
    
    <!-- World Building -->
    <article class="prose prose-slate max-w-none">
        <h2 class="font-serif text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">World Building</h2>
        <div class="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap font-sans">
{{ $project->world_building ?: 'Belum ada catatan world building...' }}</div>
    </article>
</div>
