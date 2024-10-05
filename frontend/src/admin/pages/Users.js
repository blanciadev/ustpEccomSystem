import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import UserCountComponent from '../components/UserCountComponent';
import axios from 'axios';

const Users = () => {
    const [users, setUsers] = useState([]); // State to store user data
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [error, setError] = useState(null); // State to manage error

    // Fetch user data from backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5001/admin-users-report'); // Adjust the URL as needed
                setUsers(response.data.data); // Assuming the user data is in the 'data' field
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('Failed to fetch users. Please try again later.');
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className='dash-con'>
            <AdminNav />
            <div className='dash-board'>
                <div className='dash-header'>
                    <div className='header-title'>
                        <i className='bx bxs-user-account'></i>
                        <h1>Users</h1>
                    </div>
                    <AdminHeader />
                </div>
                <div className='body'>
                    <div className='user-con'>
                        <UserCountComponent />
                        <div className='user-list'>
                            <div className='cheader'>
                                <div className='search'>
                                    <form>
                                        <input type='search' placeholder='Search...' />
                                    </form>
                                </div>
                                <div className='options'>
                                    <div className='print'>
                                        <button>Create Account</button>
                                    </div>
                                    <div className='sort'>
                                        <label htmlFor="sort">Sort By</label>
                                        <select name="sort" id="sort">
                                            <option value="date">Name</option>
                                            <option value="status">Status</option>
                                            <option value="id">ID</option>
                                            <option value="type">Type</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className='order-table'>
                                <table className='table table-hover'>
                                    <thead className='bg-light sticky-top'>
                                        <tr>
                                            <th><input type='checkbox' /></th>
                                            <th>User ID</th>
                                            <th>First Name</th>
                                            <th>Last Name</th>
                                            <th>User Type</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">Loading...</td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan="7" className="text-center text-danger">{error}</td>
                                            </tr>
                                        ) : (
                                            users.map(user => (
                                                <tr key={user.customer_id}>
                                                    <td><input type='checkbox' /></td>
                                                    <td>{user.customer_id}</td>
                                                    <td>{user.first_name}</td>
                                                    <td>{user.last_name}</td>
                                                    <td>{user.role_type}</td>
                                                    <td>{user.status}</td>
                                                    <td><button>View</button></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users;