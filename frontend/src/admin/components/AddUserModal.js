import React from 'react';

const AddUserModal = ({ show, onClose }) => {
  if (!show) return null; // Don't render the modal if it's not visible

  return (
    <div
      className="modal fade show" 
      style={{ display: 'block' }} 
      tabIndex="-1"
      aria-labelledby="addUserModalLabel"
      aria-hidden={!show} 
      onClick={onClose} 
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content" onClick={e => e.stopPropagation()}> 
          <div className="modal-header">
            <h5 className="modal-title" id="addUserModalLabel">Create New User</h5>
            
          </div>
          <div className="modal-body">
            <form>
              <input type="hidden" /> {/* for id number */}
              <div className="form-group">
                <label htmlFor="fName">First Name</label>
                <input type="text" name="fName" className="form-control" required />
              </div>
              <div className="form-group">
                <label htmlFor="lName">Last Name</label>
                <input type="text" name="lName" className="form-control" required />
              </div>
              <div className="form-group">
                <label htmlFor="userType">User Type</label>
                <select name="userType" className="form-control" required>
                  <option value="">Select Role Type</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              {/* Add more if needed */}
            </form>
          </div>
          <div className="modal-footer justify-content-evenly">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button type="submit" className="btn btn-primary">Create Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
