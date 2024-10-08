import React from 'react';
import PropTypes from 'prop-types';

const ToastNotification = ({ toastMessage }) => {
  if (!toastMessage) return null; 

  const toastStyles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: 'white',
    width: '300px',
    height: '60px',
    padding: '5px',
    color: 'black',
    borderLeft:'10px solid hotpink',
    borderTop:'1px solid hotpink',
    borderBottom:'1px solid hotpink',
    borderRight:'1px solid hotpink',
    borderRadius: '10px',
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    margin:'0',
    zIndex: 2000,
    transition: 'opacity 1s ease',
    opacity: toastMessage ? 1 : 0, //appear when toastmessage have a value
  };

  return (
    <div style={toastStyles}>
      <h6 style={{margin:'0',}}>{toastMessage}</h6>{/* */}
    </div>
  );
};

ToastNotification.propTypes = {
  toastMessage: PropTypes.string.isRequired,
};

export default ToastNotification;
