import React, { useEffect, useState } from "react";
import axios from "axios";

const UserCountComponent = () => {
  const [userCounts, setUserCounts] = useState({
    customers: 0,
    admins: 0,
    warehouseManagers: 0,
  });

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const response = await axios.get(
          "https://ustp-eccom-server.vercel.app/api/admin-users-count"
        );
        const { customers, admins, warehouseManagers } = response.data.data;

        setUserCounts({
          customers,
          admins,
          warehouseManagers,
        });
      } catch (error) {
        console.error("Error fetching user counts:", error);
      }
    };

    fetchUserCounts();
  }, []);

  return (
    <div className="container">
      <div className="row">
        {/* Customers */}
        <div className="col-12 col-md-4 p-3">
          <div
            className="card text-dark shadow"
            style={{
              background: "linear-gradient(135deg, #fbe9d7, #f6d5f7)",
              
              borderRadius: "15px",
            }}
          >
            <div className="card-body d-flex align-items-center">
              <div>
                <i className="bx bxs-user" style={{ fontSize: "30px" }}></i>
              </div>
              <div className="ms-3">
                <h5 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
                  {userCounts.customers}
                </h5>
                <p style={{ fontSize: "20px", margin: 0 }}>Customers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admins */}
        <div className="col-12 col-md-4 p-3">
          <div
            className="card text-dark shadow"
            style={{
              background: "linear-gradient(135deg, #ffeda0, #ffa585)",
              borderRadius: "15px",
            }}
          >
            <div className="card-body d-flex align-items-center">
              <div>
                <i className="bx bxs-user" style={{ fontSize: "30px" }}></i>
              </div>
              <div className="ms-3">
                <h5 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
                  {userCounts.admins}
                </h5>
                <p style={{ fontSize: "20px", margin: 0 }}>Admins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Managers */}
        <div className="col-12 col-md-4 p-3">
          <div
            className="card text-dark shadow"
            style={{
              background: "linear-gradient(135deg, #fff0f3, #ffe5eb)",
              borderRadius: "15px",
            }}
          >
            <div className="card-body d-flex align-items-center">
              <div>
                <i className="bx bxs-user" style={{ fontSize: "30px" }}></i>
              </div>
              <div className="ms-3">
                <h5 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
                  {userCounts.warehouseManagers}
                </h5>
                <p style={{ fontSize: "20px", margin: 0 }}>
                  Warehouse Managers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCountComponent;
