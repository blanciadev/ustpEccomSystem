import React from 'react'
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../admin.css'

// Register the components needed for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // X-axis labels
  datasets: [
    {
      label: 'Purchases',
      data: [30, 45, 55, 60, 70, 65, 75, 80, 85, 90, 100, 110], // Data points for Purchases
      backgroundColor: 'rgba(75, 192, 192, 0.6)', // Bar color
      borderColor: 'rgba(75, 192, 192, 1)', // Border color of bars
      borderWidth: 1, // Border width
    },
    {
      label: 'Sales',
      data: [40, 50, 65, 70, 80, 75, 85, 90, 100, 110, 120, 130], // Data points for Sales
      backgroundColor: 'rgba(153, 102, 255, 0.6)', // Bar color
      borderColor: 'rgba(153, 102, 255, 1)', // Border color of bars
      borderWidth: 1, // Border width
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false, // Allow the chart to adjust to the container's size
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
          return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
        },
      },
      backgroundColor: 'rgba(0,0,0,0.7)', // Tooltip background color
      titleColor: '#fff', // Tooltip title color
      bodyColor: '#fff', // Tooltip body color
      borderColor: '#007bff', // Tooltip border color
      borderWidth: 1, // Tooltip border width
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
      beginAtZero: true, // Start y-axis at zero
    },
  },
};

const SalesOrders =  () => {
  return (
    <div className='sales-orders'>
        <div className='header'>
            <div className='title'>
                <h5>Sales Orders</h5>
            </div> 
            <div className='see-all'>
                <button>See all</button>
            </div>
        </div>
       
        <div className='bar-chart'>
        <Bar data={data} options={options} />
        </div>
    </div>
  )
}

export default SalesOrders