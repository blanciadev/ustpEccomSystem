import React, { useState }  from 'react';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';

const Settings = () => {
    const [profileImage, setProfileImage] = useState(
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzk92qOx7c5k5fybjVbUkwg6BGW_ptjgID9A&s'
      );

    function formatPhoneNumber(event) {
        const input = event.target;
        let value = input.value.replace(/\D/g, ''); 
      
        if (event.inputType === 'deleteContentBackward') {
          return; 
        }
      
        if (!value.startsWith('639')) {
          value = '639' + value.slice(0, 9); 
        }
      
        input.value = `+${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 9)} ${value.slice(9, 12)}`;
      }

     
    
      const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          setProfileImage(imageUrl);
        }
      };
      
  return (
    <div className='dash-con'>
      <AdminNav />
      <div className='dash-board'>
        <div className='dash-header'>
          <div className='header-title'>
            <i className='bx bxs-user'></i>
            <h1>Profile</h1>
          </div>
          <AdminHeader />
        </div>
        <div className='body'>
          <div className='admin-settings'>

          <div className='admin-image'>
            <label htmlFor="file-input">
                <img src={profileImage} alt="Admin Profile" />
                <div className="overlay">Change Image</div>
            </label>
            <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
            />
            </div>



            <div className='admin-information'>
              <h3>Personal Information</h3>
              <form className='info-form'>
                <div className='form-group'>
                  <label>Name</label>
                  <input type='text' placeholder='Enter your full name' />
                </div>
                <div className='form-group'>
                  <label>Email</label>
                  <input type='email' placeholder='Enter your email' />
                </div>
                <div className="form-group">
                <label>Phone Number</label>
                <input
                    type="tel"
                    placeholder="+639 073 529 735"
                    pattern="\+639\s\d{3}\s\d{3}\s\d{3}"
                    maxLength="16"
                    required
                    onInput={formatPhoneNumber}
                />
                </div>

                <button type='submit' className='update-info-btn'>Update Info</button>
              </form>
            </div>


            <div className='admin-password'>
              <h3>Change Password</h3>
              <form className='password-form'>
                <div className='form-group'>
                  <label>Current Password</label>
                  <input type='text' placeholder='Enter current password' />
                </div>
                <div className='form-group'>
                  <label>New Password</label>
                  <input type='text' placeholder='Enter new password' />
                </div>
                <div className='form-group'>
                  <label>Confirm New Password</label>
                  <input type='text' placeholder='Confirm new password' />
                </div>
                <button type='submit' className='update-password-btn'>Update Password</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
