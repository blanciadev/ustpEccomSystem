import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../admin.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesOrders = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/sales');
        const data = await response.json();


        const labels = data.insights.map(item => {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return monthNames[item.month - 1];
        });
        const salesCounts = data.insights.map(item => item.completed_sales);
        const totalSales = data.insights.map(item => item.total_sales_amount);


        setChartData({
          labels,
          datasets: [
            {
              label: 'Completed Sales',
              data: salesCounts,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
            {
              label: 'Total Sales Amount',
              data: totalSales,
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
            }
          ],
        });
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchSalesData();
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
          },
        },
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
          display: false,
          text: 'Amount',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className='sales-orders'>
      <div className='header'>
        <div className='title'>
          <h5>Sales Orders</h5>
        </div>
      </div>
      <div className='bar-chart'>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default SalesOrders;
