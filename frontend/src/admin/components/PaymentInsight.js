import React, { useEffect, useState } from 'react';
import '../admin.css';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components needed for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PaymentInsight = () => {
    const [monthlyCounts, setMonthlyCounts] = useState([]); // State to hold monthly order counts
    const [loading, setLoading] = useState(true); // State for loading
    const [error, setError] = useState(null); // State for error handling

    useEffect(() => {
        const fetchPaymentInsight = async () => {
            try {
                const response = await axios.get('http://localhost:5001/payment-insight');
                setMonthlyCounts(response.data.monthlyCounts); // Set monthly counts from the response
            } catch (error) {
                console.error('Error fetching payment insight:', error);
                setError('Failed to fetch data.'); // Set error message
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchPaymentInsight();
    }, []);

    // Prepare data for the chart
    const data = {
        labels: monthlyCounts.map(mc => `Month ${mc.month}`), // Create labels for each month
        datasets: [
            {
                label: 'Completed Orders', // Update label to reflect the data
                data: monthlyCounts.map(mc => mc.count), // Use the counts from the monthlyCounts
                backgroundColor: 'rgba(255, 99, 132, 0.6)', // Bar color
                borderColor: 'rgba(255, 99, 132, 1)', // Border color of bars
                borderWidth: 1, // Border width
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 10,
                    boxHeight: 10,
                    padding: 10,
                    color: '#333',
                },
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`; // Use template literals for readability
                    },
                },
                backgroundColor: 'rgba(0,0,0,0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#007bff',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                title: {
                    display: false,
                    text: 'Month',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Orders',
                },
                beginAtZero: true,
            },
        },
    };

    // Loading and error states
    if (loading) {
        return <div>Loading...</div>; // Show loading indicator
    }

    if (error) {
        return <div>{error}</div>; // Show error message if there's an error
    }

    return (
        <div className='payment-insight'>
            <div className='header'>
                <div className='title'>
                    <h5>Payment Insight</h5>
                </div>
                <div className='see-all'></div>
            </div>
            <div className='bar-chart'>
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}

export default PaymentInsight;
