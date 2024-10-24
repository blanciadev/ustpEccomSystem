import React, { useState } from 'react';
import axios from 'axios';

const AddUserModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    email: '',
    phoneNumber: '',
    userType: '',
    password: ''
  });

  const [error, setError] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/admin-signup', {
        firstName: formData.fName,
        lastName: formData.lName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        userType: formData.userType,
        password: formData.password
      });

      if (response.status === 201) {
        alert('User created successfully');
        onClose();
      }
    } catch (error) {
      setError('Failed to create user');
      console.error('Error creating user:', error);
    }
  };

  if (!show) return null;

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
            <form onSubmit={handleSubmit}>
              <input type="hidden" />
              <div className="form-group">
                <label htmlFor="fName">First Name</label>
                <input
                  type="text"
                  name="fName"
                  className="form-control"
                  value={formData.fName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lName">Last Name</label>
                <input
                  type="text"
                  name="lName"
                  className="form-control"
                  value={formData.lName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  className="form-control"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="userType">User Type</label>
                <select
                  name="userType"
                  className="form-control"
                  value={formData.userType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role Type</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && <div className="alert alert-danger mt-3">{error}</div>}

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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
