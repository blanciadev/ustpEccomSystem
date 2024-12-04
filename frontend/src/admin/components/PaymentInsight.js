import React, { useEffect, useState } from 'react';
import '../admin.css';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PaymentInsight = () => {
    const [monthlyCounts, setMonthlyCounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPaymentInsight = async () => {
            try {
                const response = await axios.get('http://localhost:5001/payment-insight');
                setMonthlyCounts(response.data.monthlyCounts);
            } catch (error) {
                console.error('Error fetching payment insight:', error);
                setError('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentInsight();
    }, []);

    const data = {
        labels: monthlyCounts.map(mc => mc.month),
        datasets: [
            {
                label: 'Completed Orders',
                data: monthlyCounts.map(mc => mc.count),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
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
                        return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
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
