import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css'
import AdminNav from '../components/AdminNav'
import AdminHeader from '../components/AdminHeader';

const Inventory = () => {
    return (
        <div className='dash-con'>
            <AdminNav />
            <div className='dash-board'>
                <div className='dash-header'>
                    <div className='header-title'>
                        <i class='bx bx-notepad' ></i>
                        <h1>Inventory</h1>
                    </div>
                    <AdminHeader />
                </div>
                <div className='dash-body'>

                </div>
            </div>
        </div>
    );
};

export default Inventory