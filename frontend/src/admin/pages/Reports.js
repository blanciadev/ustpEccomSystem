import React from 'react'

import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css'
import AdminNav from '../components/AdminNav'
import AdminHeader from '../components/AdminHeader';

const Reports = () => {
  return (
    <div className='dash-con'>
        <AdminNav/>
        <div className='dash-board'>
            <div className='dash-header'>
                <div className='header-title'>
                    <i class='bx bxs-report'></i>
                    <h1>Reports</h1>
                </div>
               <AdminHeader/>
            </div>
            <div className='dash-body'>

            </div>
        </div>
    </div>


export default Reports