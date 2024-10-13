import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../pages/Transactions/Transaction.css';

const UserSideNav = () => {
  const location = useLocation();
  const [firstName, setFirstName] = useState('');
  const [profileImg, setProfileImg] = useState(''); // State for profile image
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Update state based on screen width
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // This only runs once on mount

  const fetchUserDetails = async () => {
    const token = localStorage.getItem('token');
    const customerId = localStorage.getItem('customer_id'); // Retrieve the customer ID from localStorage

    if (token && customerId) {
      try {
        const response = await fetch('http://localhost:5001/users-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ customer_id: customerId }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setFirstName(data.first_name);

        // Debugging: log the profile image data
        console.log('Profile Image Data:', data.profile_img);

        // Check if profile_img is valid
        if (data.profile_img) {
          // Handle if the profile image is a Buffer
          if (data.profile_img.data) {
            // If the profile_img is an object with a data property (Buffer)
            const base64String = btoa(String.fromCharCode(...new Uint8Array(data.profile_img.data)));
            setProfileImg(`data:image/jpeg;base64,${base64String}`);
          } else if (typeof data.profile_img === 'string') {
            // If the profile_img is already a Base64 string
            setProfileImg(`data:image/jpeg;base64,${data.profile_img}`);
          } else {
            // If the profile_img is not a string or Buffer
            console.error('Unexpected profile image format:', data.profile_img);
            setProfileImg(''); // Set to default or empty image
          }
        } else {
          console.error('No profile image found, using default image.');
          setProfileImg(''); // Fallback to default image or set to empty
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    }
  };

  useEffect(() => {
    fetchUserDetails(); // Call the function to fetch user details
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <div className='side-con'>
      <div className='side-user'>
        <img 
          src={profileImg || 'https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg'} // Default image if not available
          alt='User Profile' 
          className="user-profile-image" // Use your CSS class for styling
        />
        {isMobile ? (
          <p style={{ fontSize: '1em', textAlign: 'center' }}>{firstName}</p>
        ) : (
          <>
            <br />
            <h5>{firstName}</h5>
          </>
        )}
      </div>
      
      <div className='side-navlinks'>
        <a
          href='/user'
          className={location.pathname === '/user' ? 'active-link' : ''}
        >
          {isMobile ? (
            <i style={{ fontSize: '18pt', cursor: 'pointer' }} className="bx bxs-user-circle"></i>
          ) : (
            <p style={{ fontWeight: '500' }}>Profile</p>
          )}
        </a>
        
        <a
          href='/user/purchase'
          className={location.pathname === '/user/purchase' ? 'active-link' : ''}
        >
          {isMobile ? (
            <i style={{ fontSize: '18pt', cursor: 'pointer' }} className="bx bxs-package"></i>
          ) : (
            <p style={{ fontWeight: '500' }}>My Orders</p>
          )}
        </a>
      </div>
    </div>
  );
};

export default UserSideNav;
