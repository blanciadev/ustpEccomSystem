import React, { useState, useEffect } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await fetch('http://localhost:5001/shipments'); // Adjust the API endpoint if necessary
        if (!response.ok) {
          throw new Error('Failed to fetch shipments');
        }
        const data = await response.json();
        setShipments(data.shipments);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [currentPage]);

  const totalOrders = shipments.length;
  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const currentShipments = shipments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className='dash-con'>
      <AdminNav />
      <div className='dash-board'>
        <div className='dash-header'>
          <div className='header-title'>
            <i className='bx bxs-truck'></i>
            <h1>Shipments</h1>
          </div>
          <AdminHeader />
        </div>
        <div className='body'>
          <div className='admin-ship'>
            <div className='cheader'>
              <div className='search'>
                <form>
                  <input type='search' placeholder='Search...' />
                </form>
              </div>
              <div className='options'>
                <div className='print'>
                  <button>Print Shipment Summary</button>
                </div>
                <div className='sort'>
                  <label htmlFor='sort'>Sort By</label>
                  <select name='sort' id='sort'>
                    <option value='date'>Date</option>
                    <option value='status'>Status</option>
                    <option value='id'>ID</option>
                    <option value='customer-id'>Customer</option>
                  </select>
                </div>
              </div>
            </div>
            <div className='ship-table'>
              {loading ? (
                <p>Loading shipments...</p>
              ) : (
                <table className='table table-hover'>
                  <thead className='bg-light sticky-top'>
                    <tr>
                      <th><input type='checkbox' /></th>
                      <th>Shipment ID</th>
                      <th>Order ID</th>
                      <th>Shipment Date</th>
                      <th>Address</th>
                      <th>City</th>
                      <th>Phone Number</th>
                      <th>Postal Code</th>
                      <th>Shipment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentShipments.map((shipment) => (
                      <tr key={shipment.shipment_id}>
                        <td><input type='checkbox' /></td>
                        <td>{shipment.shipment_id}</td>
                        <td>{shipment.order_id}</td>
                        <td>{new Date(shipment.shipment_date).toLocaleDateString()}</td>
                        <td>{shipment.address}</td>
                        <td>{shipment.city}</td>
                        <td>{shipment.phoneNumber}</td>
                        <td>{shipment.postalCode}</td>
                        <td>{shipment.shipment_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* <div className='pagination-container'>
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
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipments;
