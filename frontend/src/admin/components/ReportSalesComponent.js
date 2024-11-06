import React from 'react'
import AverageOrders from './AverageOrders'
import SalesSummaryComponent from './SalesSummaryComponent'


const ReportSalesComponent = () => {
  return (
    <div className='report-sales'>
        <SalesSummaryComponent/>
        <AverageOrders/>
    </div>
  )
}

export default ReportSalesComponent