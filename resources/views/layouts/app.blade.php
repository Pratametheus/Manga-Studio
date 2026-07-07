<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'MangaStudio Dashboard')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <!-- Atau gunakan CDN Tailwind jika belum setup Vite: <script src="https://cdn.tailwindcss.com"></script> -->
    <style>
        [x-cloak] { display: none !important; }
    </style>
</head>
<body class="bg-gray-50 text-gray-900 font-sans antialiased flex h-screen overflow-hidden">
    
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-100 px-6 py-8 flex flex-col gap-8 shadow-sm h-full shrink-0">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg leading-none">M</span>
            </div>
            <h1 class="font-semibold text-gray-900 tracking-tight text-lg">MangaStudio</h1>
        </div>

        <nav class="flex flex-col gap-2">
            <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-900 bg-gray-50 rounded-lg font-medium transition-colors">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                Dashboard
            </a>
            <a href="{{ route('projects.index') }}" class="flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                Projects
            </a>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full overflow-auto">
        @yield('content')
    </main>
    
    @stack('scripts')
</body>
</html>
