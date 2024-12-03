import React, { useState, useEffect } from "react";
import Pagination from "react-bootstrap/Pagination";
import { saveAs } from "file-saver";
import "bootstrap/dist/css/bootstrap.min.css";
import "../admin.css";
import AdminNav from "../components/AdminNav";
import AdminHeader from "../components/AdminHeader";

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;

  const [statusOptions] = useState([
    "To Ship",
    "To Receive",
    "Completed",
    "Cancelled",
    "Return/Refund",
    "Pending",
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await fetch("http://localhost:5001/shipments");
        if (!response.ok) {
          throw new Error("Failed to fetch shipments");
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

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 425);
  };

  // Filter shipments based on search term
  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.shipment_id.toString().includes(searchTerm) ||
      shipment.order_id.toString().includes(searchTerm) ||
      shipment.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.phoneNumber.includes(searchTerm) ||
      shipment.postalCode.includes(searchTerm) ||
      shipment.shipment_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedShipments = filteredShipments.sort((a, b) => {
    if (sortBy === "status") {
      return a.shipment_status.localeCompare(b.shipment_status);
    }
    return new Date(a.shipment_date) - new Date(b.shipment_date);
  });

  const totalOrders = sortedShipments.length;
  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const currentShipments = sortedShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const exportToExcel = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/shipments?export=true",
        {
          method: "GET",
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export shipments");
      }

      const blob = await response.blob();

      // Get the current date and time
      const now = new Date();
      const formattedDateTime = now
        .toISOString() // e.g., "2024-11-30T15:30:45.123Z"
        .replace(/[-:]/g, "") // Remove hyphens and colons
        .replace("T", "_") // Replace 'T' with an underscore
        .split(".")[0]; // Remove milliseconds

      const fileName = `Shipment Records ${formattedDateTime}.xlsx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error.message);
    }
  };


  return (
    <div className="dash-con">
      <AdminNav />
      <div className="dash-board">
        <div className="dash-header">
          <div className="header-title">
            <i className="bx bxs-truck"></i>
            <h1>Shipments</h1>
          </div>
          <AdminHeader />
        </div>
        <div className="body">
          <div className="admin-ship">
            <div class="container align-items-center mt-4 mb-4">
              <div class="row align-items-center m-0 p-0">
                <div class="col-4">
                  <div class="search d-flex  ">
                    {" "}
                    <form onSubmit={(e) => e.preventDefault()}>
                      <input
                        type="search"
                        placeholder="Search by Order ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control"
                      />
                    </form>
                  </div>
                </div>

                <div class="col-2">
                  <div class="d-flex justify-content-center ">
                    {/* empty div */}
                  </div>
                </div>

                <div class="col-3">
                  <div class=" d-flex justify-content-end">
                    <button onClick={exportToExcel} className="btn btn-primary">
                      <i class="bx bx-export"></i> Export Shipment Record
                    </button>
                  </div>
                </div>

                <div class="col-3">
                  <div class="d-flex justify-content-end align-items-center">
                    <label htmlFor="sort" className="me-2">
                      Sort By:
                    </label>
                    <select
                      name="sort"
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="form-select"
                      style={{ width: "120px" }}
                    >
                      <option value="date">Date</option>
                      <option value="status">Status</option>
                      <option value="id">ID</option>
                      <option value="customer-id">Customer</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="ship-table ">
              <div className="mx-4" style={{ height: "400px" }}>
                <div className="">
                  {loading ? (
                    <p>Loading...</p>
                  ) : (
                    <table className="table table-hover">
                      <thead className="bg-light sticky-top">
                        <tr>
                          {/* <th>
                            <input type="checkbox" />
                          </th> */}
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
                            {/* <td>
                              <input type="checkbox" />
                            </td> */}
                            <td>{shipment.shipment_id}</td>
                            <td>{shipment.order_id}</td>
                            <td>
                              {new Date(
                                shipment.shipment_date
                              ).toLocaleDateString()}
                            </td>
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
              </div>

              <div className="d-flex justify-content-center align-items-center">
                <div className="d-flex justify-content-center align-items-center">
                  <button
                    className="me-2"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span className="px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="me-2"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipments;
