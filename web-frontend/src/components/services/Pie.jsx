import { Pie } from 'react-chartjs-2';
import { Chart as chartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { generatePieChartData } from './TestData';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Box } from '@mui/material';

// Register the plugins
chartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    ChartDataLabels
);

export const PieGraph = () => {
    // Generate data once when component mounts
    const chartData = generatePieChartData();
    
    const options = {
        responsive: true,
        animation: {
            duration: 750
        },
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#000',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function(context) {
                        const value = context.raw;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${percentage}% (${value})`;
                    }
                }
            },
            datalabels: {
                color: (context) => {
                    return context.dataIndex === 3 ? '#000' : '#fff';
                },
                font: {
                    weight: 'bold',
                    size: 14
                },
                textStrokeColor: (context) => {
                    return context.dataIndex === 3 ? '#fff' : '#000';
                },
                textStrokeWidth: 2,
                textShadowBlur: 5,
                textShadowColor: (context) => {
                    return context.dataIndex === 3 ? '#fff' : '#000';
                },
            }
        },
        layout: {
            padding: 20
        }
    }; 

    return (
        <Box sx={{ 
            backgroundColor: 'rgba(240, 240, 240, 0.9)',
            borderRadius: 4,
            p: 2,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Pie options={options} data={chartData} />
        </Box>
    );
};