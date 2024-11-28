import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

const UsersModal = ({ show, onClose, user }) => {
    // Ensure hooks are always called
    const [editableUser, setEditableUser] = useState(user || {});
    const [isEditing, setIsEditing] = useState(false);

    // Update editableUser whenever user prop changes
    useEffect(() => {
        if (user) {
            setEditableUser({ ...user });
        }
    }, [user]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setEditableUser((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleUpdate = async () => {
        try {
            // Make an API call to update the user's role
            await axios.put(`http://localhost:5001/admin-users-role-update`, {
                customer_id: editableUser.customer_id,
                role_type: editableUser.role_type,
            });
            alert('User position updated successfully!');
            setIsEditing(false);
            onClose();
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Failed to update user position. Please try again.');
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>User Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {editableUser && (
                    <div>
                        <div className="form-group">
                            <label htmlFor="customer_id"><strong>User ID:</strong></label>
                            <input
                                type="text"
                                id="customer_id"
                                className="form-control"
                                value={editableUser.customer_id || ''}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="first_name"><strong>First Name:</strong></label>
                            <input
                                type="text"
                                id="first_name"
                                className="form-control"
                                value={editableUser.first_name || ''}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="last_name"><strong>Last Name:</strong></label>
                            <input
                                type="text"
                                id="last_name"
                                className="form-control"
                                value={editableUser.last_name || ''}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone_number"><strong>Phone:</strong></label>
                            <input
                                type="text"
                                id="phone_number"
                                className="form-control"
                                value={editableUser.phone_number || 'N/A'}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address"><strong>Address:</strong></label>
                            <input
                                type="text"
                                id="address"
                                className="form-control"
                                value={editableUser.address || 'N/A'}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="date_hired"><strong>Date Hired:</strong></label>
                            <input
                                type="text"
                                id="date_hired"
                                className="form-control"
                                value={editableUser.date_hired || 'N/A'}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role_type"><strong>Position:</strong></label>
                            <select
                                id="role_type"
                                className="form-control"
                                value={editableUser.role_type || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            >
                                <option value="">{editableUser.role_type || ''}</option>
                                <option value="admin">Admin</option>
                                <option value="manager">WareHouse Manager</option>
                                <option value="user">Customer</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email"><strong>Email:</strong></label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                value={editableUser.email || 'N/A'}
                                readOnly
                            />
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                {isEditing ? (
                    <>
                        <Button variant="success" onClick={handleUpdate}>
                            Save Changes
                        </Button>
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                    </>
                ) : (
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                        Edit Position
                    </Button>
                )}
                <Button variant="danger" onClick={() => alert('Feature not yet implemented')}>
                    Delete
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UsersModal;
