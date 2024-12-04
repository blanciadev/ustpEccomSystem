import React, { useState } from 'react';
import '../admin.css';
import Dropdown from 'react-bootstrap/Dropdown';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaRegUser } from "react-icons/fa";
import { MdLogout } from "react-icons/md";


const AdminHeader = () => {

    const username = localStorage.getItem('username') || 'User';
    const firstName = localStorage.getItem('first_name') || '';
    const lastName = localStorage.getItem('last_name') || '';
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    const [profileImage, setProfileImage] = useState(null);

    (async function fetchUserData() {
        const customerId = localStorage.getItem("customer_id");
        if (!customerId) {
            console.error("No customer ID found in localStorage");
            return;
        }

        try {
            const response = await axios.get(
                `https://ustp-eccom-server.vercel.app/api/admin-users-details`,
                { params: { customer_id: customerId } }
            );

            if (response.data.data && response.data.data.length > 0) {
                const user = response.data.data[0];

                let base64Image = null;
                if (user.profile_img) {
                    if (typeof user.profile_img === 'string') {
                        base64Image = `data:image/jpeg;base64,${user.profile_img}`;
                    } else if (user.profile_img.data) {
                        const binary = new Uint8Array(user.profile_img.data).reduce(
                            (data, byte) => data + String.fromCharCode(byte),
                            ""
                        );
                        base64Image = `data:image/jpeg;base64,${window.btoa(binary)}`;
                    } else {
                        console.error('Unexpected profile image format:', user.profile_img);
                    }
                }

                setProfileImage(base64Image || null);
            } else {
                console.error("No user found with the provided customer ID.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error.message);
        }
    })();


    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                await axios.post(
                    "https://ustp-eccom-server.vercel.app/api/logout",
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                localStorage.removeItem("token");
                localStorage.clear();
                navigate("/");
            } catch (error) {
                console.error(
                    "Error logging out:",
                    error.response ? error.response.data : error.message
                );
            }
        }
    }



    return (
        <div className='header-user'>

            <div className='admin-profile'>
                <span
                    className="cartIcon d-flex justify-content-end align-items-center"
                    id="profileDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >


                    <img
                        src={
                            profileImage ||
                            "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg"
                        }
                        alt="Profile Image"
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                        }}
                    />


                    <p class="ms-2">{firstName ? firstName + ' ' + lastName : username}</p>

                </span>

                <ul
                    className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3"
                    aria-labelledby="profileDropdown"
                    style={{
                        minWidth: "200px",
                        fontFamily: "Arial, sans-serif",
                        fontSize: "14px",
                    }}
                >

                    <li>
                        <a
                            className="dropdown-item d-flex align-items-center"
                            // onClick={handleProfileClick}
                            href='/admin/profile'
                        >
                            <FaRegUser
                                className="me-2"
                                size={24}
                                style={{ color: "green" }}
                            />
                            <span style={{ fontSize: "16px" }}>Profile</span>
                        </a>
                    </li>


                    <li>
                        <hr className="dropdown-divider" />
                    </li>

                    <li>
                        <a
                            className="dropdown-item d-flex align-items-center text-danger"
                            onClick={() => setShowLogoutModal(true)}
                        >
                            <MdLogout className="me-2" size={24} />
                            <span style={{ fontSize: "16px" }}>Logout</span>
                        </a>
                    </li>

                </ul>

            </div>
            <div
                className={`modal fade ${showLogoutModal ? 'show' : ''}`}
                id="logoutModal"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="logoutModalLabel"
                aria-hidden="true"
                style={{ display: showLogoutModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}  // Ensure background dimming
            >

                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="logoutModalLabel">Confirm Logout</h5>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to log out?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminHeader;
