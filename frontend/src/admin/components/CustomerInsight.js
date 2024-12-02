import React, { useEffect, useState } from 'react';
import '../admin.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CustomerInsight = () => {
  const [chartData, setChartData] = useState({ labels: ['This Week'], datasets: [] });

  useEffect(() => {
    const fetchCustomerInsights = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/customer-insight', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();


        const userCount = data.insights[0]?.user_count || 0;

        setChartData({
          labels: ['This Week'],
          datasets: [
            {
              label: 'New Customers',
              data: [userCount],
              fill: false,
              borderColor: 'rgb(127, 163, 255)',
              backgroundColor: 'rgb(127, 163, 255)',
              tension: 0.5,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching customer insights:', error);
      }
    };

    fetchCustomerInsights();
  }, []);

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
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: false,
          text: 'Week',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Customer Count',
        },
      },
    },
  };

  return (
    <div className='customer-insight'>
      <div className='header'>
        <h5>Customers Insight</h5>
      </div>
      <div className='line-chart'>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CustomerInsight;
