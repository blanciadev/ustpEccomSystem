import React from 'react'
import '../admin.css' 
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components needed for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',], // X-axis labels
  datasets: [
    {
      label: 'New Customers',
      data: [30, 25, 45, 50, 60, 65, 70, 45, 50, 60, 65, 70],
      fill: false,
      borderColor: 'rgb(127, 163, 255)', 
      backgroundColor: 'rgb(127, 163, 255)', 
      tension: 0.5,
    },
    {
      label: 'Inactive Customers',
      data: [10, 15, 20, 15, 10, 12, 8, 25, 15, 50, 30, 65, 70],
      fill: false,
      borderColor: 'rgb(255, 127, 127)', 
      backgroundColor: 'rgb(255, 127, 127)', 
      tension: 0.5,
    },
    {
      label: 'Active Customers',
      data: [50, 60, 70, 65, 75, 80, 85, 65, 70, 45,10, 15, 20],
      fill: false,
      borderColor: 'rgb(127, 255, 150)', 
      backgroundColor: 'rgb(127, 255, 150)', 
      tension: 0.5,
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
      },
    },
    tooltip: {
      callbacks: {
        label: function(tooltipItem) {
          return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
        }
      }
    }
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
      },
    },
  },
};

const CustomerInsight = () => {
  return (
    <div className='customer-insight'>
        <div className='header'>
            <div className='title'>
                <h5>Customers Insight</h5>
            </div> 
            <div className='see-all'>
                <button>See all</button>
            </div>
        </div>
        <div className='line-chart'>
        <Line data={data} options={options} />
        </div>
    </div>
  )
}

export default CustomerInsight