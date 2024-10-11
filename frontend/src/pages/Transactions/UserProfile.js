import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../../components/Navigation';
import UserSideNav from '../../components/UserSideNav';
import './UserProfile.css'; // Make sure to create this CSS file for styling

const UserProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // State to handle editing mode
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

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      const customerId = localStorage.getItem('customer_id');

      try {
        const response = await axios.post('http://localhost:5001/users-details', { customer_id: customerId }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDetails(response.data);
        setFormData(response.data); // Set form data for editing
      } catch (error) {
        console.error('Error fetching user details:', error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
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
      alert(response.data.message);
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

  return (
    <div className='order-con'>
      <Navigation />
      <div className='order-box'>
        <div className='user'>
          <UserSideNav />
        </div>
        <div className='purchase'>
          <div className='purchase-box'>
            <div className='purchase-header'>
              <h2>User Profile</h2>
              <button onClick={handleEditToggle} className='edit-button'>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : userDetails ? (
              <div className='user-details'>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className='edit-form'>
                    <input
                      type='text'
                      name='first_name'
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder='First Name'
                      required
                    />
                    <input
                      type='text'
                      name='last_name'
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder='Last Name'
                      required
                    />
                    <input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder='Email'
                      required
                    />
                    <input
                      type='text'
                      name='phone_number'
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder='Phone Number'
                      required
                    />
                    <input
                      type='text'
                      name='address'
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder='Address'
                      required
                    />
                    <input
                      type='text'
                      name='street_name'
                      value={formData.street_name}
                      onChange={handleInputChange}
                      placeholder='Street Name'
                      required
                    />
                    <input
                      type='text'
                      name='region'
                      value={formData.region}
                      onChange={handleInputChange}
                      placeholder='Region'
                      required
                    />
                    <input
                      type='text'
                      name='postal_code'
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      placeholder='Postal Code'
                      required
                    />
                    <button type='submit' className='save-button'>Save Changes</button>
                  </form>
                ) : (
                  <div>
                    <p><strong>First Name:</strong> {userDetails.first_name}</p>
                    <p><strong>Last Name:</strong> {userDetails.last_name}</p>
                    <p><strong>Email:</strong> {userDetails.email}</p>
                    <p><strong>Phone Number:</strong> {userDetails.phone_number}</p>
                    <p><strong>Address:</strong> {userDetails.address}, {userDetails.street_name}, {userDetails.region} {userDetails.postal_code}</p>
                    <p><strong>Role:</strong> {userDetails.role_type}</p>
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
