import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { Chart as chartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { generateBarChartData } from './TestData';
import { Box, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

chartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const BarGraph = ({ data, updateInterval = 3000 }) => {
    const [chartData, setChartData] = useState(generateBarChartData());
    const [monthIndex, setMonthIndex] = useState(0);
    
    const options = {
        responsive: true,
        animation: {
            duration: 750
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                    color: '#000'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#000'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#000',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: 20
                }
            }
        }
    }; 

    useEffect(() => {
        const interval = setInterval(() => {
            setMonthIndex(prev => (prev + 1) % 12); // Cycle through 12 months
        }, updateInterval);

        return () => clearInterval(interval);
    }, [updateInterval]);

    useEffect(() => {
        setChartData(generateBarChartData(monthIndex));
    }, [monthIndex, data]);

    return (
        <Box sx={{ 
            backgroundColor: 'rgba(240, 240, 240, 0.9)',
            borderRadius: 4,
            p: 2
        }}>
            <Bar options={options} data={chartData} />
        </Box>
    );
};

export const ClientJoinChart = ({ clients }) => {
    const { t } = useTranslation();
    const [clientJoinData, setClientJoinData] = useState(null);

    useEffect(() => {
        prepareLineChartData(clients);
    }, [clients]);

    const prepareLineChartData = (clientsData) => {
        // Create data for a custom line chart
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Prepare client data by day of week
        const clientsByDay = {
            'Monday': 0,
            'Tuesday': 0,
            'Wednesday': 0,
            'Thursday': 0,
            'Friday': 0,
            'Saturday': 0,
            'Sunday': 0
        };
        
        // Count clients by day of week
        clientsData.forEach(client => {
            if (client.assigned_at) {
                const joinDate = new Date(client.assigned_at);
                const dayOfWeek = daysOfWeek[joinDate.getDay() === 0 ? 6 : joinDate.getDay() - 1]; // Convert to Monday-Sunday format
                clientsByDay[dayOfWeek]++;
            }
        });
        
        // Create line chart data directly
        const chartData = {
            labels: daysOfWeek,
            datasets: [
                {
                    label: t('Clients Joined'),
                    data: daysOfWeek.map(day => clientsByDay[day]),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                }
            ]
        };
        
        console.log('Custom line chart data:', chartData);
        setClientJoinData(chartData);
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: t('Number of Clients')
                },
                ticks: {
                    precision: 0 // Only show whole numbers
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    title: (context) => {
                        return context[0].label;
                    },
                    label: (context) => {
                        return `${context.dataset.label}: ${context.raw} ${context.raw === 1 ? 'client' : 'clients'}`;
                    }
                }
            }
        }
    };

    return (
        <Box height={300}>
            {clientJoinData ? (
                <Line data={clientJoinData} options={chartOptions} />
            ) : (
                <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress size={30} />
                </Box>
            )}
        </Box>
    );
};