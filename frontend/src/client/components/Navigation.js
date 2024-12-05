import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { cartEventEmitter } from "./eventEmitter";
import "../../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ToastNotification from "../../public/components/ToastNotification";

import { BsCart } from "react-icons/bs";

import { FaRegUser } from "react-icons/fa";
import { MdOutlineShoppingBag } from "react-icons/md";
import { MdLogout } from "react-icons/md";
import { MdOutlineHome } from "react-icons/md";

import logo from "../../assets/img/logo.png";

const Navigation = () => {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [profileImg, setProfileImg] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const storedFirstName = localStorage.getItem("first_name");
    const customerId = localStorage.getItem("customer_id");

    window.addEventListener("resize", handleResize);

    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUsername || "");
      setFirstName(storedFirstName || "");
      fetchUserDetails(customerId);
    }

    fetchCartItemCount();
    cartEventEmitter.on("cartUpdated", fetchCartItemCount);

    return () => {
      cartEventEmitter.off("cartUpdated", fetchCartItemCount);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchUserDetails = async (customerId) => {
    if (!customerId) return;
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "https://ustp-eccom-server.vercel.app/api/users-details",
        { customer_id: customerId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userData = response.data;

      if (userData && userData.profile_img) {
        if (typeof userData.profile_img === "string") {
          setProfileImg(`data:image/jpeg;base64,${userData.profile_img}`);
        } else if (userData.profile_img.data) {
          const base64String = btoa(
            new Uint8Array(userData.profile_img.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          setProfileImg(`data:image/jpeg;base64,${base64String}`);
        } else {
          console.error(
            "Unexpected profile image format:",
            userData.profile_img
          );
          setProfileImg("");
        }
      } else {
        console.log("No profile image found, using default image.");
        setProfileImg(
          "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg"
        );
      }
    } catch (error) {
      console.error(
        "Error fetching user details:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const fetchCartItemCount = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItemCount(cart.reduce((total, item) => total + item.quantity, 0));
      return;
    }

    try {
      const response = await axios.get(
        "https://ustp-eccom-server.vercel.app/api/cart-item-count",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setCartItemCount(response.data.itemCount);
      }
    } catch (error) {
      console.error(
        "Error fetching cart item count:",
        error.response ? error.response.data : error.message
      );
    }
  };

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
      } catch (error) {
        console.error(
          "Error logging out:",
          error.response ? error.response.data : error.message
        );
      }
    }

    if (!token) {
      localStorage.setItem('redirectTo', '/');
      setRedirectToLogin(true);
    }

    // localStorage.clear();
    setToastMessage("Logged Out!");
    // window.location.href = "/login";
    setTimeout(() => {
      setToastMessage("");

    }, 3000);
  };


  const [redirectToHome, setRedirectToLogin] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  return (
    <div className="nav-container d-flex justify-content-between align-items-center p-3 ">
      <ToastNotification toastMessage={toastMessage} />

      <div className="logo d-flex align-items-center">
        <a href="/" className="d-flex align-items-center">
          <img
            src={logo}
            alt="Logo"
            className="me-2"
            style={{ height: "50px", width: "50px" }}
          />
          {isMobile ? <p></p> : <h1 className="custom-h1">N&B Beauty Vault</h1>}
        </a>
      </div>

      <button className="menu-toggle" onClick={toggleMenu}>
        {isMenuOpen ? (
          <i className="bx bx-x"></i>
        ) : (
          <i className="bx bx-menu"></i>
        )}
      </button>

      <div className="navlinks">
        <ul className={`linklist ${isMenuOpen ? "active" : ""}`}>
          <li>
            <Link to="/shop">shop</Link>
          </li>
          <li>
            <Link to="/cart#" className="cart">
              Cart ({cartItemCount})
            </Link>
          </li>

          {!isLoggedIn ? (
            <>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
              <li>
                <Link to="/login" className="login">
                  Login
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <div className="dropdown">
                  <span
                    className="cartIcon"
                    id="profileDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {isMobile ? (
                      <p style={{ fontWeight: "400" }}>Profile</p>
                    ) : (
                      <img
                        src={
                          profileImg ||
                          "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg"
                        }
                        alt="Profile Image"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                        }}
                      />
                    )}
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
                      <Link to="/" className="dropdown-item d-flex align-items-center">
                        <MdOutlineHome
                          className="me-2"
                          size={26}
                          style={{ color: "orange" }}
                        />
                        <span style={{ fontSize: "16px" }}>Home</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/user" className="dropdown-item d-flex align-items-center">
                        <FaRegUser
                          className="me-2"
                          size={24}
                          style={{ color: "green" }}
                        />
                        <span style={{ fontSize: "16px" }}>Profile</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/user/purchase" className="dropdown-item d-flex align-items-center">
                        <MdOutlineShoppingBag
                          className="me-2"
                          size={24}
                          style={{ color: "blue" }}
                        />
                        <span style={{ fontSize: "16px" }}>My Orders</span>
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center text-danger"
                        onClick={() => setShowLogoutModal(true)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "0",
                          cursor: "pointer",
                        }}
                      >
                        <MdLogout className="me-2" size={24} />
                        <span style={{ fontSize: "16px" }}>Logout</span>

                      </button>

                    </li>
                  </ul>
                </div>
              </li>
            </>
          )}
        </ul>
      </div>

      <div
        className={`modal fade ${showLogoutModal ? "show" : ""}`}
        id="logoutModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="logoutModalLabel"
        aria-hidden="true"
        style={{
          display: showLogoutModal ? "block" : "none",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="logoutModalLabel">
                Confirm Logout
              </h5>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to log out?</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
              {redirectToHome && <Link to="/">Redirecting to Login...</Link>}


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
