import React, { useState, useEffect } from 'react'
import { Head, Link, usePage } from '@inertiajs/react'

export default function Layout({ title, children, lastSync }) {
    const [currentTime, setCurrentTime] = useState(new Date())
    const { url } = usePage()

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const formatLastSync = (lastSyncTime) => {
        if (!lastSyncTime) return 'Never'
        const syncDate = new Date(lastSyncTime)
        const now = new Date()
        const diffMs = now - syncDate
        const diffMins = Math.floor(diffMs / 60000)
        
        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins} min ago`
        
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`
        
        return syncDate.toLocaleDateString()
    }

    const isActive = (path) => {
        if (path === '/' && url === '/') return true
        if (path !== '/' && url.startsWith(path)) return true
        return false
    }

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                                                <div className="flex items-center space-x-6">
                        <Link
                            href="/"
                            className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                            Prophit
                        </Link>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            MVP
                        </span>
                        <nav className="flex space-x-4">
                            <Link
                                href="/"
                                className={`text-sm font-medium transition-colors ${
                                    isActive('/') 
                                        ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                                        : 'text-gray-700 hover:text-blue-600'
                                }`}
                            >
                                Live Feed
                            </Link>
                            <Link
                                href="/historic"
                                className={`text-sm font-medium transition-colors ${
                                    isActive('/historic') 
                                        ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                                        : 'text-gray-700 hover:text-blue-600'
                                }`}
                            >
                                Historic Data
                            </Link>
                        </nav>
                    </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-600">
                                    Data synced: {formatLastSync(lastSync)}
                                </div>
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Live data"></div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-white border-t mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="text-center text-sm text-gray-500">
                            <p>Prophit MVP - Tracking significant movements in prediction markets</p>
                            <p className="mt-1">Data from Polymarket • Updates every 5 minutes</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}
