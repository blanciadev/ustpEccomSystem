import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../admin.css';

const UserCountComponent = () => {
    const [userCounts, setUserCounts] = useState({
        customers: 0,
        admins: 0,
        warehouseManagers: 0,
    });

    useEffect(() => {
        const fetchUserCounts = async () => {
            try {
                const response = await axios.get('http://localhost:5001/admin-users-count');
                const { customers, admins, warehouseManagers } = response.data.data;

                setUserCounts({
                    customers,
                    admins,
                    warehouseManagers,
                });
            } catch (error) {
                console.error('Error fetching user counts:', error);
            }
        };

        fetchUserCounts();
    }, []);

    return (
        <div className='user-counts'>
            <div className='customers'>
                <div className='qty'>
                    <i className='bx bxs-user'></i>
                    <h6>{userCounts.customers}</h6>
                </div>
                <div>
                    <h6>Customers</h6>
                </div>
            </div>

            <div className='admins'>
                <div className='qty'>
                    <i className='bx bxs-user-badge'></i>
                    <h6>{userCounts.admins}</h6>
                </div>
                <div>
                    <h6>Admins</h6>
                </div>
            </div>

            <div className='warehouse-managers'>
                <div className='qty'>
                    <i className='bx bxs-store-alt'></i>
                    <h6>{userCounts.warehouseManagers}</h6>
                </div>
                <div>
                    <h6>Warehouse Managers</h6>
                </div>
            </div>
        </div>
    );
};

export default UserCountComponent;
