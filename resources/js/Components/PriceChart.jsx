import React, { useEffect, useRef } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
)

export default function PriceChart({ priceHistory, market, movements = [] }) {
    const chartRef = useRef()

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Probability Over Time',
                font: {
                    size: 16,
                    weight: 'bold',
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        return `Probability: ${(context.parsed.y * 100).toFixed(2)}%`
                    },
                    afterLabel: function(context) {
                        const movement = movements.find(m => {
                            const movementTime = new Date(m.movement_detected_at).getTime()
                            const dataTime = new Date(context.parsed.x).getTime()
                            return Math.abs(movementTime - dataTime) < 3600000 // Within 1 hour
                        })
                        return movement ? `Movement: ${movement.formatted_change}` : ''
                    }
                }
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    displayFormats: {
                        hour: 'MMM dd, HH:mm',
                        day: 'MMM dd',
                    }
                },
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                min: 0,
                max: 1,
                ticks: {
                    callback: function(value) {
                        return (value * 100).toFixed(0) + '%'
                    }
                },
                title: {
                    display: true,
                    text: 'Probability'
                }
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
    }

    const data = {
        datasets: [
            {
                label: 'Probability',
                data: priceHistory.map(point => ({
                    x: point.x,
                    y: point.y,
                })),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
            },
        ],
    }

    // Add movement markers
    if (movements.length > 0) {
        const movementPoints = movements.map(movement => ({
            x: movement.movement_detected_at,
            y: parseFloat(movement.probability_after),
        }))

        data.datasets.push({
            label: 'Significant Movements',
            data: movementPoints,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgb(239, 68, 68)',
            borderWidth: 0,
            pointRadius: 8,
            pointHoverRadius: 10,
            pointBackgroundColor: 'rgb(239, 68, 68)',
            pointBorderColor: 'white',
            pointBorderWidth: 3,
            showLine: false,
        })
    }

    return (
        <div className="h-96 w-full">
            <Line ref={chartRef} options={options} data={data} />
        </div>
    )
}
