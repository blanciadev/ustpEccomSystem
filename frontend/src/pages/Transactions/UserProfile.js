import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../../components/Navigation';
import UserSideNav from '../../components/UserSideNav';
import './UserProfile.css';
import ProfileImageUpload from '../../components/ProfileImageUpload';
import ToastNotification from '../../components/ToastNotification';

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
        const response = await axios.post('http://localhost:5001/users-details', { customer_id: customerId }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Update state with user details and form data
        setUserDetails(response.data);
        setFormData(response.data); // Set form data for editing

        // If profile_img is a blob or base64 string, set it for the image
        if (response.data.profile_img) {
          const imgBlob = new Blob([new Uint8Array(response.data.profile_img.data)], { type: 'image/jpeg' }); // Adjust type as necessary
          const imgUrl = URL.createObjectURL(imgBlob);
          setFormData((prev) => ({ ...prev, profile_img: imgUrl })); // Set img URL in formData
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

    // Prepare the formData including the customer ID
    const updatedData = {
      customer_id: customerId,
      ...formData, // Assuming formData contains first_name, last_name, email, etc.
    };

    try {
      const response = await axios.put('http://localhost:5001/users-details', updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Notify user of success
      setToastMessage('Updated Successfully!');

      // Clear toast message after 3 seconds
      setTimeout(() => {
        setToastMessage('');
      }, 3000);

      console.log(response.data.message);
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        ...formData, // Update userDetails with the edited data
      }));
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      console.error('Error updating user details:', error.response ? error.response.data : error.message);
      alert('Failed to update user details. Please try again.'); // Notify user of failure
    }
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);  // Update state based on screen width
  };

  return (
    <div className='order-con'>
      <Navigation />
      <ToastNotification toastMessage={toastMessage} />
      <div className='order-box'>
        <div className='user'>
          <UserSideNav />
        </div>
        <div className='purchase'>
          <div className='purchase-box2'>
            <div className='purchase-header'>
              <h2>User Profile</h2>
              <button onClick={handleEditToggle} className='edit-button'>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <ProfileImageUpload formData={formData} />
            {loading ? (
              <div className='cskeleton-item' style={{ gridColumn: 'span 2' }}></div>
            ) : userDetails ? (
              <div className='user-details'>
                {/* Display profile image from backend */}
                
                {isEditing ? (
                  <form onSubmit={handleSubmit} className='edit-user'>
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
                    <button type='submit' className='save-button'>
                      {isMobile ? <i className='bx bxs-save'></i> : 'Save Changes'}
                    </button>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
