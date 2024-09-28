import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css'
import AdminNav from '../components/AdminNav'
import AdminHeader from '../components/AdminHeader';
import UserCountComponent from '../components/UserCountComponent';

const Users = () => {
    return (
        <div className='dash-con'>
            <AdminNav />
            <div className='dash-board'>
                <div className='dash-header'>
                    <div className='header-title'>
                        <i class='bx bxs-user-account'></i>
                        <h1>Users</h1>
                    </div>
                    <AdminHeader />
                </div>
                <div className='body'>
                    <div className='user-con'>
                        <UserCountComponent/>
                        <div className='user-list'>
                            <div className='cheader'>
                                <div className='search'>
                                    <form>
                                    <input type='search' placeholder='Search...'/>
                                    </form>
                                </div>

                                <div className='options'>
                                    <div className='print'>
                                    <button >Create Account</button>
                                    </div>
                                    <div className='sort'>
                                    <label for="sort">Sort By</label>

                                    <select name="sort" id="sort">
                                        <option value="date">Name</option>
                                        <option value="status">Status</option>
                                        <option value="id">ID</option>
                                        <option value="type">type</option>
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
                                     
                                        <tr>
                                        <td><input type='checkbox' /></td>
                                        <td>user id</td>
                                        <td>fname</td>
                                        <td>lname</td>
                                        <td>user type</td>
                                        <td>user status</td>
                                        <td><button>View</button></td>
                                        </tr>
                                    
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

export default Users