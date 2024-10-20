import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import UserCountComponent from '../components/UserCountComponent';
import axios from 'axios';
import AddUserModal from '../components/AddUserModal';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);
    const [searchTerm, setSearchTerm] = useState(''); // State for search input
    const [currentPage, setCurrentPage] = useState(1); // State for pagination
    const recordsPerPage = 10; // Set records per page

    // Function to toggle modal visibility
    const toggleModal = () => {
        setShowModal(!showModal);
    };

    // Fetch user data from backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5001/admin-users-report');
                setUsers(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('Failed to fetch users. Please try again later.');
                setLoading(false);
            }
        };

        fetchUsers();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleResize = () => {
        setIsMobile(window.innerWidth <= 425);  // Update state based on screen width
    };

    // Filter users based on the search term
    const filteredUsers = users.filter(user => {
        const searchValue = searchTerm.toLowerCase();
        return (
            user.first_name.toLowerCase().includes(searchValue) ||
            user.last_name.toLowerCase().includes(searchValue) ||
            user.role_type.toLowerCase().includes(searchValue)
        );
    });

    // Calculate the paginated users
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstRecord, indexOfLastRecord);

    // Calculate total pages
    const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

    // Function to change the current page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                                        <input
                                            type='search'
                                            placeholder='Search...'
                                            value={searchTerm} // Bind input to searchTerm state
                                            onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on input change
                                        />
                                    </form>
                                </div>
                                <div className='options'>
                                    <div className='print'>
                                        <button onClick={toggleModal}>
                                            {isMobile ? (<i className='bx bxs-user-plus'></i>) : ('Create Account')}
                                        </button>
                                    </div>
                                    <div className='sort'>
                                        <label htmlFor="sort">Sort By</label>
                                        <select name="sort" id="sort">
                                            <option value="name">Name</option>
                                            <option value="type">Type</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className='users-table'>
                                <table className='table table-hover'>
                                    <thead className='bg-light sticky-top'>
                                        <tr>
                                            <th><input type='checkbox' /></th>
                                            <th>User ID</th>
                                            <th>First Name</th>
                                            <th>Last Name</th>
                                            <th>User Type</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">Loading...</td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan="6" className="text-center text-danger">{error}</td>
                                            </tr>
                                        ) : (
                                            currentUsers.map(user => (
                                                <tr key={user.customer_id}>
                                                    <td><input type='checkbox' /></td>
                                                    <td>{user.customer_id}</td>
                                                    <td>{user.first_name}</td>
                                                    <td>{user.last_name}</td>
                                                    <td>{user.role_type}</td>
                                                    <td><button>View</button></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                {/* Pagination Component */}
                                <nav>
                                    <ul className='pagination'>
                                        {Array.from({ length: totalPages }, (_, index) => (
                                            <li key={index + 1} className={`page-item ${index + 1 === currentPage ? 'active' : ''}`}>
                                                <button onClick={() => paginate(index + 1)} className='page-link'>
                                                    {index + 1}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AddUserModal show={showModal} onClose={toggleModal} />
        </div>
    );
};

export default Users;
