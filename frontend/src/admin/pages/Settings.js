import React, { useState, useEffect } from 'react';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const Settings = () => {
  const [profileImage, setProfileImage] = useState(
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzk92qOx7c5k5fybjVbUkwg6BGW_ptjgID9A&s'
  );

  const [userData, setUserData] = useState({
    firstName: '',
    email: '',
    phone: '',
    profile_image: null,
  });
  const [error, setError] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const customerId = localStorage.getItem("customer_id");
      if (!customerId) {
        setError("No customer ID found in localStorage");
        return;
      }

      try {
        const response = await axios.get(
          `https://ustp-eccom-server.vercel.app/api/admin-users-details`,
          { params: { customer_id: customerId } }
        );

        if (response.data.data && response.data.data.length > 0) {
          const user = response.data.data[0];

          // Convert LONG BLOB to Base64
          let base64Image = null;
          if (user.profile_img) {
            if (typeof user.profile_img === 'string') {
              base64Image = `data:image/jpeg;base64,${user.profile_img}`;
            } else if (user.profile_img.data) {
              const binary = new Uint8Array(user.profile_img.data).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ""
              );
              base64Image = `data:image/jpeg;base64,${window.btoa(binary)}`;
            } else {
              console.error('Unexpected profile image format:', user.profile_img);
            }
          }

          setUserData({
            firstName: user.first_name,
            email: user.email,
            phone: user.phone_number,
            profile_image: base64Image,
          });
        } else {
          setError("No user found with the provided customer ID.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        setError("Failed to retrieve user data. Please try again later.");
      }
    };

    fetchUserData();
  }, []);


  const handleInfoSubmit = async (e) => {
    e.preventDefault();

    const customerId = localStorage.getItem('customer_id');


    try {
      const response = await axios.put(
        'https://ustp-eccom-server.vercel.app/api/admin-users-details-update',
        {
          customer_id: customerId,
          first_name: userData.firstName,
          email: userData.email,
          phone_number: userData.phone,

        }
      );

      if (response.status === 200) {
        alert('User information updated successfully!');
      }
    } catch (error) {
      console.error('Error updating user data:', error.message);
      alert('Failed to update user information. Please try again.');
    }
  };


  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const formatPhoneNumber = (event) => {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');

    // if (event.inputType === 'deleteContentBackward') {
    //   return;
    // }

    // if (!value.startsWith('639')) {
    //   value = '639' + value.slice(0, 9);
    // }

    // input.value = `+${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 9)} ${value.slice(9, 12)}`;
  };

  const ChangePassword = () => {
    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }

    const customerId = localStorage.getItem('customer_id');
    if (!customerId) {
      console.error('No customer ID found in localStorage');
      return;
    }

    try {
      const response = await axios.put('https://ustp-eccom-server.vercel.app/api/admin-users-password-update', {
        customer_id: customerId,
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      if (response.status === 200) {
        alert('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error updating password:', error.message);
      alert('Failed to update password. Please check your current password and try again.');
    }
  };


  return (
    <div className="dash-con">
      <AdminNav />
      <div className="dash-board">
        <div className="dash-header">
          <div className="header-title">
            <i className="bx bxs-user"></i>
            <h1>Profile</h1>
          </div>
          <AdminHeader />
        </div>
        <div className="body">
          <div className="admin-settings">
            <div className="admin-image">
              {/* <label htmlFor="file-input"> */}
              {userData.profile_image ? (
                <img
                  src={userData.profile_image}
                  alt="Admin Profile"
                  style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                />
              ) : (
                <div className="placeholder">No Image Available</div>
              )}
              {/* <div className="overlay">Change Image</div> */}
              {/* </label> */}
              <input
                id="file-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>

            <div className="admin-information">
              <h3>Personal Information</h3>
              <form className="info-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={userData.firstName}
                    onChange={(e) => {
                      const value = e.target.value;
                      const regex = /^[A-Za-z\s]*$/;

                      if (regex.test(value)) {
                        setUserData({ ...userData, firstName: value });
                      }
                    }}
                  />

                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={userData.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                      if (regex.test(value) || value === "") {
                        setUserData({ ...userData, email: value });
                      }
                    }}
                  />

                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+639 073 529 735"
                    pattern="\+639\s\d{3}\s\d{3}\s\d{3}"
                    maxLength="16"
                    value={userData.phone}
                    onInput={formatPhoneNumber}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  />
                </div>

                <button
                  type="button"
                  className="update-info-btn"
                  onClick={handleInfoSubmit}
                >
                  Update Info
                </button>

              </form>
            </div>

            <div className="admin-password">
              <h3>Change Password</h3>
              <form className="password-form" onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                  />
                </div>
                <button type="submit" className="update-password-btn">
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
