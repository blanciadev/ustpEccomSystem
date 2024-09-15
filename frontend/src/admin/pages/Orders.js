import React, {useState} from 'react'
import Pagination from 'react-bootstrap/Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css'
import AdminNav from '../components/AdminNav'
import AdminHeader from '../components/AdminHeader';

const Orders = () => {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Change this based on your preference
  
  const totalOrders = 1; // Replace with actual number of orders
  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className='dash-con'>
        <AdminNav/>
        <div className='dash-board'>
            <div className='dash-header'>
                <div className='header-title'>
                    <i class='bx bxs-package' ></i>
                    <h1>Orders</h1>
                </div>
                <AdminHeader/>
            </div>
            <div className='dash-body'>
              <div className='admin-order'>
                <div className='order-header'>
                  <div className='order-search'>
                    <form>
                      <input type='search'/>
                      <button>Search</button>
                    </form>
                  </div>

                  <div className='order-options'>
                    <div className='order-print'>
                      <button>Print Order Summary</button>
                    </div>
                    <div className='order-sort'>
                      <label for="sort">Sort By</label>

                      <select name="sort" id="sort">
                        <option value="date">Date</option>
                        <option value="status">Status</option>
                        <option value="id">ID</option>
                        <option value="customer-id">customer</option>
                      </select>
                    </div>
                    
                  </div>
                </div>
                <div className='order-table'>
                <table>
                  <thead>
                    <tr>
                      <th><input type='checkbox'/></th>
                      <th>Order ID</th>
                      <th>Customer ID</th>
                      <th>Order Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                  <tr>
                      <td><input type='checkbox'/></td>
                      <td>Order ID</td>
                      <td>Customer ID</td>
                      <td>Order Date</td>
                      <td>Status</td>
                      <td><button>View</button></td>
                    </tr>
                    
                  </tbody>
                </table>

                </div>
                <div className='pagination-container'>
                  <Pagination>
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {[...Array(totalPages).keys()].map(pageNumber => (
                      <Pagination.Item
                        key={pageNumber + 1}
                        active={pageNumber + 1 === currentPage}
                        onClick={() => handlePageChange(pageNumber + 1)}
                      >
                        {pageNumber + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                  </Pagination>
                </div>
              </div>

            </div>
        </div>
    </div>
  )
}

export default Orders