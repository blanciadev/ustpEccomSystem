import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../admin.css';

const UserCountComponent = () => {
    const [userCounts, setUserCounts] = useState({
        newUsers: 0,
        totalEmployees: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
    });

    // Fetch user data from backend when the component mounts
    useEffect(() => {
        const fetchUserCounts = async () => {
            try {
                const response = await axios.get('http://localhost:5001/admin-users-count');
                const users = response.data.data; // Assuming the user data is in the 'data' field

                // Calculate user counts
                const newUsersCount = users.filter(user => user.role_type === 'user').length;
                const totalEmployeesCount = users.filter(user => user.role_type === 'employee').length;
                const activeCustomersCount = users.filter(user => user.status === 'active').length; // Assuming you have a status field
                const inactiveCustomersCount = users.filter(user => user.status === 'inactive').length; // Assuming you have a status field

                setUserCounts({
                    newUsers: newUsersCount,
                    totalEmployees: totalEmployeesCount,
                    activeCustomers: activeCustomersCount,
                    inactiveCustomers: inactiveCustomersCount,
                });
            } catch (error) {
                console.error('Error fetching user counts:', error);
            }
        };

        fetchUserCounts();
    }, []);

    return (
        <div className='user-counts'>
            <div className='new-users'>
                <div className='qty'>
                    <i className='bx bxs-user-plus'></i>
                    <h6>{userCounts.newUsers}</h6> {/* Displaying the count */}
                </div>
                <div>
                    <h6>New Users</h6>
                </div>
            </div>

            <div className='employees'>
                <div className='qty'>
                    <i className='bx bxs-user-badge'></i>
                    <h6>{userCounts.totalEmployees}</h6> {/* Displaying the count */}
                </div>
                <div>
                    <h6>Total Employees</h6>
                </div>
            </div>

            <div className='active-users'>
                <div className='qty'>
                    <i className='bx bxs-user'></i>
                    <h6>{userCounts.activeCustomers}</h6> {/* Displaying the count */}
                </div>
                <div>
                    <h6>Active Customers</h6>
                </div>
            </div>

            <div className='inactive-users'>
                <div className='qty'>
                    <i className='bx bxs-user-x'></i>
                    <h6>{userCounts.inactiveCustomers}</h6> {/* Displaying the count */}
                </div>
                <div>
                    <h6>Inactive Customers</h6>
                </div>
            </div>
        </div>
    );
};

export default UserCountComponent;
