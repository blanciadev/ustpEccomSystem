import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../admin.css";
import AdminNav from "../components/AdminNav";
import AdminHeader from "../components/AdminHeader";
import UserCountComponent from "../components/UserCountComponent";
import axios from "axios";
import AddUserModal from "../components/AddUserModal";
import UsersModal from "../components/UsersModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [selectedUser, setSelectedUser] = useState(null);

  const toggleAddUserModal = () => {
    setShowAddUserModal(!showAddUserModal);
  };

  const toggleUserModal = () => {
    setShowUserModal(!showUserModal);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/admin-users-report"
        );
        setUsers(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again later.");
        setLoading(false);
      }
    };

    fetchUsers();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 425);
  };

  const filteredUsers = users.filter((user) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchValue) ||
      user.last_name.toLowerCase().includes(searchValue) ||
      user.role_type.toLowerCase().includes(searchValue)
    );
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentUsers = filteredUsers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="dash-con">
      <AdminNav />
      <div className="dash-board">
        <div className="dash-header">
          <div className="header-title">
            <i className="bx bxs-user-account"></i>
            <h1>Users</h1>
          </div>
          <AdminHeader />
        </div>
        <div className="body">
          <div className="user-con">
            <UserCountComponent />
            <div className="user-list">
              <div class="container align-items-center mb-2">
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

                  <div class="col-4">
                    <div class=" d-flex justify-content-end">
                      <button
                        onClick={toggleAddUserModal}
                        className="btn btn-primary"
                      >
                        {isMobile ? (
                          <i className="bx bxs-user-plus"></i>
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </div>
                  </div>

                  <div class="col-2 ">
                    <div class="d-flex justify-content-end align-items-center py-2">
                      <label class="me-2" htmlFor="sort ">
                        Sort By
                      </label>
                      <select name="sort" id="sort">
                        <option value="name">Name</option>
                        <option value="type">Type</option>
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
                            <th>
                              <input type="checkbox" />
                            </th>
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
                              <td colSpan="6" className="text-center">
                                Loading...
                              </td>
                            </tr>
                          ) : error ? (
                            <tr>
                              <td
                                colSpan="6"
                                className="text-center text-danger"
                              >
                                {error}
                              </td>
                            </tr>
                          ) : (
                            currentUsers.map((user) => (
                              <tr key={user.customer_id}>
                                <td>
                                  <input type="checkbox" />
                                </td>
                                <td>{user.customer_id}</td>
                                <td>{user.first_name}</td>
                                <td>{user.last_name}</td>
                                <td>{user.role_type}</td>
                                <td>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      toggleUserModal();
                                    }}
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <nav>
                  <ul className="pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${
                          index + 1 === currentPage ? "active" : ""
                        }`}
                      >
                        <button
                          onClick={() => paginate(index + 1)}
                          className="page-link"
                        >
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

      <AddUserModal show={showAddUserModal} onClose={toggleAddUserModal} />
      <UsersModal
        show={showUserModal}
        onClose={toggleUserModal}
        user={selectedUser}
      />
    </div>
  );
};

export default Users;
