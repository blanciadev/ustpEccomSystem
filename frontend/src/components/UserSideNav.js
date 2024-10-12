import  React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../pages/Transactions/Transaction.css';

const UserSideNav = () => {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('email');
    const storedFirstName = localStorage.getItem('first_name');
    window.addEventListener('resize', handleResize);

    if (token) {
        setIsLoggedIn(true);
        setUsername(storedUsername || '');
        setFirstName(storedFirstName || '');
    }

    return () => {
        window.removeEventListener('resize', handleResize);
    };
    }, []);

    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);  // Update state based on screen width
    };

  return (
    <div className='side-con'>
      <div className='side-user'>
        <img 
            src='https://steamuserimages-a.akamaihd.net/ugc/2040726635496857485/B1EBAA2FC123ABD19B0A467C4A7EB0D0184DDA40/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false' 
            alt='User Profile' 
        
        />{/* users profile */}
        {isMobile ? (
            <p style={{fontSize:'1em', textAlign:'center'}}
            >{firstName}</p>
        ):(
            <h5>{firstName}</h5>,
            <p>{username}</p>
        )

        }
        
      </div>
      <div className='side-navlinks'>
        <a
          href='/user'
          className={location.pathname === '/user' ? 'active-link' : ''}
        >
        {isMobile ? (
            
            <i style={{ fontSize: '18pt', cursor: 'pointer' }} className="bx bxs-user-circle"></i> 
        ) : (
            <p style={{fontWeight:'500'}}>Profile</p> 
        )}
        </a>
        <a
          href='/user/purchase'
          className={location.pathname === '/user/purchase' ? 'active-link' : ''}
        >
          {isMobile ? (
            
            <i style={{ fontSize: '18pt', cursor: 'pointer' }} className="bx bxs-package"></i>
        ) : ( 
            <p style={{fontWeight:'500'}}>My Orders</p>
        )}
        </a>
      </div>
    </div>
  );
};

export default UserSideNav;