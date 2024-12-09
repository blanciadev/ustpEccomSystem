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

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await fetch("https://ustp-eccom-server.vercel.app/api/shipments");
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
  const filteredShipments = shipments.filter((shipment) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      shipment.shipment_id.toString().includes(searchTerm) ||
      shipment.order_id.toString().includes(searchTerm) ||
      shipment.customer_id?.toString().includes(searchTerm) ||
      new Date(shipment.shipment_date).toLocaleDateString().includes(searchTerm) ||
      shipment.streetname?.toLowerCase().includes(searchLower) ||
      shipment.address?.toLowerCase().includes(searchLower) ||
      shipment.city?.toLowerCase().includes(searchLower) ||
      shipment.phoneNumber?.toString().includes(searchTerm) ||
      shipment.postalCode?.toString().includes(searchTerm) ||
      shipment.shipment_status?.toLowerCase().includes(searchLower)
    );
  });

  const sortedShipments = filteredShipments.sort((a, b) => {
    switch (sortBy) {
      case "status":
        return a.shipment_status.localeCompare(b.shipment_status);
      case "date":
        return new Date(a.shipment_date) - new Date(b.shipment_date);
      case "customer_id":
        return (a.customer_id?.toString() || "").localeCompare(b.customer_id?.toString() || "");
      default:
        return 0;
    }
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
        "https://ustp-eccom-server.vercel.app/api/shipments?export=true",
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
        .toISOString()
        .replace(/[-:]/g, "")
        .replace("T", "_")
        .split(".")[0];

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
                      <option value="customer_id">Customer ID</option>
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
                          <th>Shipment ID</th>
                          <th>Order ID</th>
                          <th>Customer ID</th>
                          <th>Shipment Date</th>
                          <th>Street Name</th>
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
                            <td>{shipment.shipment_id}</td>
                            <td>{shipment.order_id}</td>
                            <td>{shipment.customer_id || "N/A"}</td>
                            <td>
                              {new Date(shipment.shipment_date).toLocaleDateString()}
                            </td>
                            <td>{shipment.streetname || "N/A"}</td>
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