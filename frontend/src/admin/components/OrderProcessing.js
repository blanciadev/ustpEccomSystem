import React, { useState, useEffect } from 'react';
import '../admin.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

const OrderProcessing = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/admin-order-history-total-component');  // Your API endpoint
        const { statusCounts } = response.data;

        setChartData({
          labels: ['Completed', 'Pending', 'To Ship', 'To Receive', 'Cancelled', 'Return/Refund', 'Returned'],
          datasets: [
            {
              label: 'Order Status',
              data: [
                statusCounts.Completed,
                statusCounts['To Process'],
                statusCounts['To Ship'],
                statusCounts['To Receive'],
                statusCounts.Cancelled,
                statusCounts['Return/Refund'],
                statusCounts.Returned,
              ],
              backgroundColor: [
                'rgba(42,212,125, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(245,78,78, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(201, 203, 207, 0.5)',
              ],
              borderColor: [
                'rgba(42,212,125, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(245,78,78, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(201, 203, 207, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching order history:', err.message);
        setError('Error fetching order data.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
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
            return tooltipItem.label + ': ' + tooltipItem.raw + ' orders';  // Tooltip label format
          },
        },
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#007bff',
        borderWidth: 1,
      },
    },
    layout: {
      padding: {
        right: 0,
      },
    },
    elements: {
      arc: {
        borderWidth: 1,
      },
    },
    cutout: '70%',
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className='order-processing'>
      <div className='header'>
        <div className='title'>
          <h6>Order Processing</h6>
        </div>
      </div>
      <div className='doughnut-chart'>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default OrderProcessing;
