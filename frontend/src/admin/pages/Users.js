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

  const [sortType, setSortType] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

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
          "https://ustp-eccom-server.vercel.app/api/admin-users-report"
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

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortType === "type") {
      if (a.role_type.toLowerCase() < b.role_type.toLowerCase()) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (a.role_type.toLowerCase() > b.role_type.toLowerCase()) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    } else if (sortType === "id") {
      return sortDirection === "asc"
        ? a.customer_id - b.customer_id
        : b.customer_id - a.customer_id;
    }
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentUsers = sortedUsers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === "type") {
      setSortType("type");
    } else if (value === "id") {
      setSortType("id");
    }
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

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
              <div className="container align-items-center mb-2">
                <div className="row align-items-center m-0 p-0">
                  <div className="col-4">
                    <div className="search d-flex">
                      <form onSubmit={(e) => e.preventDefault()}>
                        <input
                          type="search"
                          placeholder="Search by name or role..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="form-control"
                        />
                      </form>
                    </div>
                  </div>

                  <div className="col-2"></div>

                  <div className="col-4">
                    <div className="d-flex justify-content-end">
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

                  <div className="col-2">
                    <div className="d-flex justify-content-end align-items-center py-2">
                      <label className="me-2" htmlFor="sort">
                        Sort By
                      </label>
                      <select
                        name="sort"
                        id="sort"
                        value={sortType}
                        onChange={handleSortChange}
                        className="form-select"
                      >
                        <option value="id">ID</option>
                        <option value="type">User Type</option>
                      </select>
                      <button
                        className="btn btn-secondary ms-2"
                        onClick={toggleSortDirection}
                        title={`Sort: ${sortDirection === "asc" ? "Ascending" : "Descending"
                          }`}
                      >
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ship-table">
                <div className="mx-4" style={{ height: "400px" }}>
                  <div>
                    {loading ? (
                      <p>Loading...</p>
                    ) : (
                      <table className="table table-hover">
                        <thead className="bg-light sticky-top">
                          <tr>
                            {/* <th>
                              <input type="checkbox" />
                            </th> */}
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
                                {/* <td>
                                  <input type="checkbox" />
                                </td> */}
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
                        className={`page-item ${index + 1 === currentPage ? "active" : ""
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
