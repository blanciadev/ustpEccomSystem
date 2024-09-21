import React, { useState, useEffect } from 'react';
import '../admin.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios'; // Ensure you have axios installed for API calls

// Register the components needed for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const OrderProcessing = () => {
  const [chartData, setChartData] = useState(null);  // For storing chart data
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state

  // Fetch data from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admin-order-history-total-component');  // Your API endpoint
        const { statusCounts } = response.data;

        // Update chartData using the fetched status counts
        setChartData({
          labels: ['Completed', 'Pending', 'To Ship', 'To Receive', 'Cancelled', 'Return/Refund', 'In Transit', 'Returned'],
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
                statusCounts['In Transit'],
                statusCounts.Returned,
              ],
              backgroundColor: [
                'rgba(42,212,125, 0.5)', // Color for Completed
                'rgba(255, 159, 64, 0.5)', // Color for Pending
                'rgba(245,78,78, 0.5)', // Color for To Ship
                'rgba(54, 162, 235, 0.5)', // Color for To Receive
                'rgba(153, 102, 255, 0.5)', // Color for Cancelled
                'rgba(255, 206, 86, 0.5)', // Color for Return/Refund
                'rgba(75, 192, 192, 0.5)', // Color for In Transit
                'rgba(201, 203, 207, 0.5)', // Color for Returned
              ],
              borderColor: [
                'rgba(42,212,125, 1)', // Border for Completed
                'rgba(255, 159, 64, 1)', // Border for Pending
                'rgba(245,78,78, 1)', // Border for To Ship
                'rgba(54, 162, 235, 1)', // Border for To Receive
                'rgba(153, 102, 255, 1)', // Border for Cancelled
                'rgba(255, 206, 86, 1)', // Border for Return/Refund
                'rgba(75, 192, 192, 1)', // Border for In Transit
                'rgba(201, 203, 207, 1)', // Border for Returned
              ],
              borderWidth: 1,  // Border width
            },
          ],
        });

        setLoading(false);  // Stop loading
      } catch (err) {
        console.error('Error fetching order history:', err.message);
        setError('Error fetching order data.');
        setLoading(false);  // Stop loading in case of error
      }
    };

    fetchData();
  }, []);

  // Chart configuration options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Adjusts to container's size
    plugins: {
      legend: {
        position: 'right',  // Position of the legend
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 10,
          color: '#333',  // Legend text color
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.label + ': ' + tooltipItem.raw + ' orders';  // Tooltip label format
          },
        },
        backgroundColor: 'rgba(0,0,0,0.7)',  // Tooltip background color
        titleColor: '#fff',  // Tooltip title color
        bodyColor: '#fff',  // Tooltip body color
        borderColor: '#007bff',  // Tooltip border color
        borderWidth: 1,  // Tooltip border width
      },
    },
    layout: {
      padding: {
        right: 0,  // Padding to prevent legend cutoff
      },
    },
    elements: {
      arc: {
        borderWidth: 1,
      },
    },
    cutout: '70%',  // Adjust doughnut width
  };

  // Render loading, error or chart data
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
