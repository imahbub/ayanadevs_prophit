<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title inertia>{{ config('app.name', 'Prophit') }}</title>

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-gray-50">
        <div id="loading-indicator" style="text-align: center; padding: 50px; font-family: sans-serif;">
            <h2>⏳ Loading Prophit...</h2>
            <p>If this message doesn't disappear, there may be a JavaScript error.</p>
            <p>Check the browser console (F12) for errors.</p>
        </div>
        @inertia
        
        <script>
            // Hide loading indicator when React mounts
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(() => {
                    const app = document.getElementById('app');
                    const loading = document.getElementById('loading-indicator');
                    if (app && app.children.length > 0) {
                        loading.style.display = 'none';
                    }
                }, 2000);
            });
        </script>
    </body>
</html>
