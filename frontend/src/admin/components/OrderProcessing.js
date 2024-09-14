import React from 'react'
import '../admin.css'
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the components needed for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ['Completed', 'Pending', 'Waiting'], // Labels for the doughnut chart
  datasets: [
    {
      label: 'Order Status',
      data: [50, 30, 20], // Data for each segment of the doughnut chart
      backgroundColor: [
        'rgba(42,212,125, 0.5)', // Color for Completed
        'rgba(255, 159, 64, 0.5)', // Color for Pending
        'rgba(245,78,78, 0.5)', // Color for Waiting
      ],
      borderColor: [
        'rgba(42,212,125, 1)', // Border color for Completed
        'rgba(255, 159, 64, 1)', // Border color for Pending
        'rgba(245,78,78, 1)', // Border color for Waiting
      ],
      borderWidth: 1, // Border width of the doughnut segments
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false, // Allow the chart to adjust to the container's size
  plugins: {
    legend: {
      position: 'right', // Position of the legend
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        padding: 10,
        color: '#333', // Color of the legend text
      },
    },
    tooltip: {
      callbacks: {
        label: function (tooltipItem) {
          return tooltipItem.label + ': ' + tooltipItem.raw + '%'; // Tooltip label format
        },
      },
      backgroundColor: 'rgba(0,0,0,0.7)', // Tooltip background color
      titleColor: '#fff', // Tooltip title color
      bodyColor: '#fff', // Tooltip body color
      borderColor: '#007bff', // Tooltip border color
      borderWidth: 1, // Tooltip border width
    },
  },
  layout: {
    padding: {
      right: 0, // Add padding to the right to avoid cutting off the legend
    },
  },
  elements: {
    arc: {
      borderWidth: 1,
    },
  },
  cutout: '70%', // Adjust this value to change the width of the doughnut
};

const OrderProcessing = () => {
  return (
    <div className='order-processing'>
        <div className='header'>
            <div className='title'>
                <h6>Order Processing</h6>
            </div> 
        </div>
        <div className='doughnut-chart'>
          <Doughnut data={data} options={options} />
        </div>
    </div>
  )
}

export default OrderProcessing