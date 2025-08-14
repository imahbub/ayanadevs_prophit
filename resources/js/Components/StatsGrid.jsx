import React from 'react'

export default function StatsGrid({ stats, threshold = 10 }) {
    const statItems = [
        {
            label: 'Active Markets',
            value: stats.active_markets || 0,
            description: 'Currently tracked markets',
            color: 'blue'
        },
        {
            label: 'Movements Today',
            value: stats.total_movements_today || 0,
            description: 'All price changes detected',
            color: 'gray'
        },
        {
            label: 'Significant Movements',
            value: stats.significant_movements_today || 0,
            description: `${threshold}%+ changes in 24h`,
            color: 'red'
        }
    ]

    const getColorClasses = (color) => {
        const colors = {
            blue: 'text-blue-600 bg-blue-50',
            gray: 'text-gray-600 bg-gray-50',
            red: 'text-red-600 bg-red-50',
            green: 'text-green-600 bg-green-50'
        }
        return colors[color] || colors.gray
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow border p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                {item.label}
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {item.value.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {item.description}
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-lg ${getColorClasses(item.color)} flex items-center justify-center ml-4`}>
                            <div className="w-6 h-6 rounded-full bg-current opacity-20"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
