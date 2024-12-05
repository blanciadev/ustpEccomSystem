import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../../components/Navigation';
import UserSideNav from '../../components/UserSideNav';
import './UserProfile.css';
// Test redeployment this is commented as this return error on deployment build
// import ProfileImageUpload from '../../components/ProfileImageUpload';
import ToastNotification from '../../../public/components/ToastNotification';

const UserProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    street_name: '',
    region: '',
    postal_code: '',
    role_type: ''
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      const customerId = localStorage.getItem('customer_id');
      window.addEventListener('resize', handleResize);

      try {
        const response = await axios.post('https://ustp-eccom-server.vercel.app/api/users-details', { customer_id: customerId }, {
          headers: { Authorization: `Bearer ${token}` },
        });


        setUserDetails(response.data);
        setFormData(response.data);

        if (response.data.profile_img) {
          const imgBlob = new Blob([new Uint8Array(response.data.profile_img.data)], { type: 'image/jpeg' }); // Adjust type as necessary
          const imgUrl = URL.createObjectURL(imgBlob);
          setFormData((prev) => ({ ...prev, profile_img: imgUrl }));
        }
      } catch (error) {
        console.error('Error fetching user details:', error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
    return () => {
      window.removeEventListener('resize', handleResize);
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
    const token = localStorage.getItem('token');
    const customerId = localStorage.getItem('customer_id');

    const updatedData = {
      customer_id: customerId,
      ...formData,
      current_password: formData.current_password,
    };

    console.log(updatedData);

    try {
      const response = await axios.put('https://ustp-eccom-server.vercel.app/api/users-details', updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setToastMessage('Updated Successfully!');

      setTimeout(() => {
        setToastMessage('');
      }, 3000);

      console.log(response.data.message);
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        ...formData,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user details:', error.response ? error.response.data : error.message);
      alert('Failed to update user details. Please try again.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const customerId = localStorage.getItem('customer_id');

    if (formData.new_password !== formData.confirm_password) {
      alert('New password and confirmation do not match.');
      return;
    }

    const passwordData = {
      customer_id: customerId,
      current_password: formData.current_password,
      new_password: formData.new_password,
    };

    try {
      const response = await axios.put('https://ustp-eccom-server.vercel.app/api/update-password', passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setToastMessage('Password Updated Successfully!');

      setTimeout(() => {
        setToastMessage('');
      }, 3000);

      console.log(response.data.message);
      setFormData((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));
    } catch (error) {
      console.error('Error updating password:', error.response ? error.response.data : error.message);
      alert('Failed to update password. Please try again.');
    }
  };


  // static resized
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  return (
    <div className='order-con'>
      <Navigation />
      <ToastNotification toastMessage={toastMessage} />
      <div className='order-box'>
        <div className='user'>
          <UserSideNav />
        </div>
        <div className='purchase2'>
          <h2>User Profile</h2>
          <div className='purchase-box2'>
            {/* <div className='purchase-header'>
              <button onClick={handleEditToggle} className='edit-button'>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div> */}

            {/* <ProfileImageUpload formData={formData} /> */}

            {loading ? (
              <div className='cskeleton-item' style={{ gridColumn: 'span 2' }}></div>
            ) : userDetails ? (
              <div className='user-details'>
                <div className='purchase-header'>
                  <h1>Personal Details</h1>
                  {isEditing ?
                    (
                      <div>
                        <button type='submit' className='save-button' form="edit-user">
                          {isMobile ? <i className='bx bxs-save'></i> : 'Save Changes'}
                        </button>
                        <button onClick={handleEditToggle} >Cancel</button>
                      </div>
                    ) : (
                      <button onClick={handleEditToggle} className='edit-button'>Edit
                      </button>
                    )}
                </div>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className='edit-user' id='edit-user'>
                    <label>First Name</label>
                    <input
                      type='text'
                      name='first_name'
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder='First Name'
                      required
                    />
                    <label>Last Name</label>
                    <input
                      type='text'
                      name='last_name'
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder='Last Name'
                      required
                    />
                    <label>Email</label>
                    <input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder='Email'
                      required
                    />
                    <label>Phone Number</label>
                    <input
                      type='text'
                      name='phone_number'
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder='Phone Number'
                      required
                    />
                    <label>Address</label>
                    <input
                      type='text'
                      name='address'
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder='Address'
                      required
                    />
                    <label>Street Name</label>
                    <input
                      type='text'
                      name='street_name'
                      value={formData.street_name}
                      onChange={handleInputChange}
                      placeholder='Street Name'
                      required
                    />
                    <label>Region</label>
                    <input
                      type='text'
                      name='region'
                      value={formData.region}
                      onChange={handleInputChange}
                      placeholder='Region'
                      required
                    />
                    <label>Postal Code</label>
                    <input
                      type='text'
                      name='postal_code'
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      placeholder='Postal Code'
                      required
                    />

                  </form>
                ) : (
                  <div className='userDetails'>
                    <p><strong>First Name:</strong></p><p>{userDetails.first_name}</p>
                    <p><strong>Last Name:</strong></p><p>{userDetails.last_name}</p>
                    <p><strong>Email:</strong></p><p>{userDetails.email}</p>
                    <p><strong>Phone Number:</strong></p><p>{userDetails.phone_number}</p>
                    <p><strong>Address:</strong></p><p>{userDetails.address} {userDetails.street_name} {userDetails.region} {userDetails.postal_code}</p>
                    {/* <p><strong>Role:</strong></p><p>{userDetails.role_type}</p> */}
                  </div>
                )}
              </div>
            ) : (
              <p>No user details found.</p>
            )}

            <div className='user-password'>
              <div className=''>
                <h1>Change Password</h1>
                <div>
                  <button type='submit' className='save-button' form="change-password">
                    {isMobile ? <i className='bx bxs-save'></i> : 'Update Password'}
                  </button>
                </div>
              </div>
              <form id='change-password' onSubmit={handlePasswordChange}>
                <div className='form-group'>
                  <label>Current Password</label>
                  <input
                    type='password'
                    name='current_password'
                    value={formData.current_password}
                    onChange={handleInputChange}
                    placeholder='Enter current password'
                    required
                  />
                </div>
                <div className='form-group'>
                  <label>New Password</label>
                  <input
                    type='password'
                    name='new_password'
                    value={formData.new_password}
                    onChange={handleInputChange}
                    placeholder='Enter new password'
                    required
                  />
                </div>
                <div className='form-group'>
                  <label>Confirm New Password</label>
                  <input
                    type='password'
                    name='confirm_password'
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder='Confirm new password'
                    required
                  />
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;