import React, { useState, useEffect } from "react";
import axios from "axios";
import Navigation from "../../components/Navigation";
import UserSideNav from "../../components/UserSideNav";
import "./UserProfile.css";
import ProfileImageUpload from "../../components/ProfileImageUpload";
import ToastNotification from "../../../public/components/ToastNotification";


import Footer from '../../../client/components/Footer';

const UserProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    street_name: "",
    region: "",
    postal_code: "",
    role_type: "",
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token");
      const customerId = localStorage.getItem("customer_id");
      window.addEventListener("resize", handleResize);

      try {
        const response = await axios.post(
          "http://localhost:5001/users-details",
          { customer_id: customerId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUserDetails(response.data);
        setFormData(response.data);

        if (response.data.profile_img) {
          const imgBlob = new Blob(
            [new Uint8Array(response.data.profile_img.data)],
            { type: "image/jpeg" }
          ); // Adjust type as necessary
          const imgUrl = URL.createObjectURL(imgBlob);
          setFormData((prev) => ({ ...prev, profile_img: imgUrl }));
        }
      } catch (error) {
        console.error(
          "Error fetching user details:",
          error.response ? error.response.data : error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customer_id");

    const updatedData = {
      customer_id: customerId,
      ...formData,
    };

    try {
      const response = await axios.put(
        "http://localhost:5001/users-details",
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setToastMessage("Updated Successfully!");

      setTimeout(() => {
        setToastMessage("");
      }, 3000);

      console.log(response.data.message);
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        ...formData,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error(
        "Error updating user details:",
        error.response ? error.response.data : error.message
      );
      alert("Failed to update user details. Please try again.");
    }
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  return (


    <>
    <div className="order-con">
      <Navigation />
      <ToastNotification toastMessage={toastMessage} />
      <div className="order-box">
        <div className="user">
          <UserSideNav />
        </div>

        <div className="purchase2 ">
          <div className="purchase-box2 mt-2">
            <div class="m-0 p-0">
              <h2 class="mt-4 ms-4 ">My Profile</h2>
              <p class="ms-4 ">Manage and protect your account</p>
            </div>
            {/* <div className='purchase-header'>
              <button onClick={handleEditToggle} className='edit-button'>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div> */}

            <div class="container ">
              <div class="mx-4">
                <div class="row">
                  <div class="col-4 ">
                    <div class="d-flex justify-content-center align-items-center  ">
                      <div class="">
                        <ProfileImageUpload formData={formData} />
                      </div>
                    </div>
                  </div>

                  <div class="col-8 ">
                    {loading ? (
                      <div
                        className="cskeleton-item"
                        style={{ gridColumn: "span 2" }}
                      ></div>
                    ) : userDetails ? (
                      <div className="user-details">
                        <div className="purchase-header">
                          <h1 class="ms-3">Personal Details</h1>
                          {isEditing ? (
                            <div>
                              <button
                                type="submit"
                                className="save-button"
                                form="edit-user"
                              >
                                {isMobile ? (
                                  <i className="bx bxs-save"></i>
                                ) : (
                                  "Save Changes"
                                )}
                              </button>
                              <button onClick={handleEditToggle}>Cancel</button>
                            </div>
                          ) : (
                            <button
                              onClick={handleEditToggle}
                              className="edit-button"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <form
                            onSubmit={handleSubmit}
                            className="edit-user"
                            id="edit-user"
                          >
                            <label>First Name</label>
                            <input
                              type="text"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                              placeholder="First Name"
                              required
                            />
                            <label>Last Name</label>
                            <input
                              type="text"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                              placeholder="Last Name"
                              required
                            />
                            <label>Email</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Email"
                              required
                            />
                            <label>Phone Number</label>
                            <input
                              type="text"
                              name="phone_number"
                              value={formData.phone_number}
                              onChange={handleInputChange}
                              placeholder="Phone Number"
                              required
                            />
                            <label>Street Name</label>
                            <input
                              type="text"
                              name="street_name"
                              value={formData.street_name}
                              onChange={handleInputChange}
                              placeholder="Street Name"
                              required
                            />
                            <label>Address</label>
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Address"
                              required
                            />

                            <label>Postal Code</label>
                            <input
                              type="text"
                              name="postal_code"
                              value={formData.postal_code}
                              onChange={handleInputChange}
                              placeholder="Postal Code"
                              required
                            />
                            <label>Region</label>
                            <input
                              type="text"
                              name="region"
                              value={formData.region}
                              onChange={handleInputChange}
                              placeholder="Region"
                              required
                            />
                          </form>
                        ) : (
                          <form className="userDetails" id="userDetails">
                            <label>First Name</label>
                            <input
                              type="text"
                              name="first_name"
                              value={userDetails.first_name}
                              disabled
                            />
                            <label>Last Name</label>
                            <input
                              type="text"
                              name="last_name"
                              value={userDetails.last_name} //change destails nako
                              disabled
                            />

                            <label>Email</label>
                            <input
                              type="email"
                              name="email"
                              value={userDetails.email}
                              disabled
                            />
                            <label>Phone Number</label>
                            <input
                              type="text"
                              name="phone_number"
                              value={userDetails.phone_number}
                              disabled
                            />
                            <label>Street Name</label>
                            <input
                              type="text"
                              name="street_name"
                              value={userDetails.street_name}
                              disabled
                            />
                            <label>Address</label>
                            <input
                              type="text"
                              name="address"
                              value={userDetails.address}
                              disabled
                            />

                            <label>Postal Code</label>
                            <input
                              type="text"
                              name="postal_code"
                              value={userDetails.postal_code}
                              disabled
                            />
                            <label>Region</label>
                            <input
                              type="text"
                              name="region"
                              value={userDetails.region}
                              disabled
                            />
                          </form>
                        )}
                      </div>
                    ) : (
                      <p>No user details found.</p>
                    )}

                    <div className="user-password">
                      <div className="purchase-header">
                        <h1 class="ms-3">Change Password</h1>
                        <div>
                          <button
                            type="submit"
                            className="save-button"
                            form="change-password"
                          >
                            {isMobile ? (
                              <i className="bx bxs-save"></i>
                            ) : (
                              "Update Password"
                            )}
                          </button>
                        </div>
                      </div>
                      <form id="change-password">
                        <div className="form-group">
                          <label>Current Password</label>
                          <input
                            type="text"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div className="form-group">
                          <label>New Password</label>
                          <input type="text" placeholder="Enter new password" />
                        </div>
                        <div className="form-group">
                          <label>Confirm New Password</label>
                          <input
                            type="text"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>

<Footer/>

    </> 
  );
};

export default UserProfile;
