import React from 'react'
import { createRoot } from 'react-dom/client'

function TestComponent() {
    return (
        <div style={{ padding: '20px', border: '2px solid green', margin: '10px' }}>
            <h3 style={{ color: 'green' }}>✅ React is working!</h3>
            <p>This is a standalone React component for testing.</p>
            <button onClick={() => alert('React event handling works!')}>
                Test Button
            </button>
        </div>
    )
}

// Only mount if the test container exists
const container = document.getElementById('react-test')
if (container) {
    const root = createRoot(container)
    root.render(<TestComponent />)
}
