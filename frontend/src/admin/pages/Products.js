
import React, { useState } from 'react'
import Pagination from 'react-bootstrap/Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css'
import AdminNav from '../components/AdminNav'
import AdminHeader from '../components/AdminHeader';
import TopProduct from '../components/TopProduct';

const Products = () => {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Change this based on your preference

  const totalOrders = 1; // Replace with actual number of orders
  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  return (
    <div className='dash-con'>
      <AdminNav />
      <div className='dash-board'>
        <div className='dash-header'>
          <div className='header-title'>
            <i class='bx bxs-spa'></i>
            <h1>Products</h1>
          </div>
          <AdminHeader />
        </div>
        <div className='dash-body'>
          <div className='product-con'>
            <div className='product-one'>
              <div className='product-qty'>

                <div className='best-selling'>
                  <div className='qty'>
                    <i class='bx bxs-spa'></i>
                    <h6>23</h6>
                  </div>
                  <div>
                    <h6>Best Selling</h6>
                    <p>Items that sell in large quantities, due to high demand, popularity, and quality</p>
                  </div>
                </div>



                <div className='in-stock'>
                  <div className='qty'>
                    <i class='bx bxs-spa'></i>
                    <h6>23</h6>
                  </div>
                  <div>
                    <h6>In Stock</h6>
                    <p>Available for sale</p>
                  </div>
                </div>



                <div className='low-stock'>
                  <div className='qty'>
                    <i class='bx bxs-spa'></i>
                    <h6>23</h6>
                  </div>
                  <div>
                    <h6>Low Stock</h6>
                    <p>Available but limited quantity</p>
                  </div>
                </div>


                <div className='unpopular'>
                  <div className='qty'>
                    <i class='bx bxs-spa'></i>
                    <h6>23</h6>
                  </div>
                  <div>
                    <h6>Unpopular</h6>
                    <p>Items that sell in smaller quantities, and lack demand, popularity, and quality</p>
                  </div>
                </div>



                <div className='out-of-stock'>
                  <div className='qty'>
                    <i class='bx bxs-spa'></i>
                    <h6>23</h6>
                  </div>
                  <div>
                    <h6>Out of Stock</h6>
                    <p>Currently Unavailable</p>
                  </div>
                </div>



                <div className='discontinued'>
                  <div className='qty'>
                    <i class='bx bxs-spa'></i>
                    <h6>23</h6>
                  </div>
                  <div>
                    <h6>Discontinued</h6>
                    <p>No longer available or produced</p>
                  </div>
                </div>

              </div>
              <TopProduct />
            </div>
            <div className='product-two'>
              {/* table */}
              <div className='order-header'>
                <div className='order-search'>
                  <form>
                    <input type='search' />
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
                      <th><input type='checkbox' /></th>
                      <th>Order ID</th>
                      <th>Customer ID</th>
                      <th>Order Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><input type='checkbox' /></td>
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
    </div>
  );
};
export default Products