<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Prophit Test Page</h1>
    <p class="success">✅ Laravel is working!</p>
    <p>Server time: {{ now() }}</p>
    <p>Market count: {{ \App\Models\Market::count() }}</p>
    
    <h2>Asset Loading Test</h2>
    @vite(['resources/css/app.css', 'resources/js/test-react.jsx'])
    
    <div id="react-test">
        <p class="error">❌ React not loaded yet...</p>
    </div>
    
    <hr>
    <h2>Inertia Test</h2>
    <div id="app">
        <p class="error">❌ Inertia not loaded yet...</p>
    </div>
    
    <script>
        console.log('Test page loaded');
        console.log('Vite asset loading...');
        
        // Check if assets are loading
        setTimeout(() => {
            const appDiv = document.getElementById('app');
            if (appDiv && appDiv.innerHTML.includes('❌')) {
                console.error('React failed to mount');
                appDiv.innerHTML = '<p style="color: red;">❌ React failed to mount - check browser console for errors</p>';
            }
        }, 3000);
        
        // Monitor for JavaScript errors
        window.addEventListener('error', (e) => {
            console.error('JavaScript error:', e.error);
            const appDiv = document.getElementById('app');
            if (appDiv) {
                appDiv.innerHTML += '<p style="color: red;">JS Error: ' + e.message + '</p>';
            }
        });
    </script>
</body>
</html>
