import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ToastNotification from "../../public/components/ToastNotification";
import "./BundlingModal.css";

const BundlingModal = ({ show, handleClose, handleSubmit }) => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [size, setSize] = useState("500");
  const [customSize, setCustomSize] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "https://ustp-eccom-server.vercel.app/api/product-category"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const text = await response.text();
        if (!text) {
          throw new Error("Empty response body");
        }

        const data = JSON.parse(text);
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories.");
      }
    };
    fetchCategories();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const customerId = localStorage.getItem("customer_id");

    if (!customerId) {
      setError("Customer ID is missing.");
      return;
    }

    if (
      !productName ||
      !description ||
      !category ||
      !price ||
      !quantity ||
      !imageURL
    ) {
      setError("Please fill out all required fields.");
      return;
    }

    if (size === "Other" && !customSize) {
      setError("Please provide a custom size.");
      return;
    }

    //console.log("Image URL before submission:", imageURL);

    const productData = {
      productName,
      description,
      category,
      price,
      quantity,
      expirationDate,
      imageURL,
      size: size === "Other" ? customSize : size,
      customerId,
    };

    try {
      const response = await fetch(
        "https://ustp-eccom-server.vercel.app/api/add-product",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.text();
      //console.log(result);

      setToastMessage("Successful!");
      setTimeout(() => {
        setToastMessage("");
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product.");
    }
  };

  return (
    <>
      <div
        className={`modal fade ${show ? "show" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ display: show ? "block" : "none" }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >

            
         
          <div className="modal-content border border-danger"  >
            <div className="modal-header order-head">
              <h5 className="modal-title">
                <i className="bx bxs-package"></i> Bundling Products Sellable
                and Non-sellable
              </h5>
              <button
                type="button"
                className="close"
                onClick={handleClose}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <ToastNotification toastMessage={toastMessage} />
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="container mt-4">
                <div>
                    <div>
                    <select class="form-select form-select-sm" aria-label="Small select example">
  <option selected>Select category to bundle</option>
  <option value="1">Hair Spa  <p class="text-primary">Sellable: 3</p>  <p class="text-danger">Non-Sellable: 1</p></option>
  <option value="2">Absolut Repair</option>
  <option value="3">
    Absolut Repair Molecular 
    <p className="fw-bold text-white">Sellable: 3</p> 
    <p className="text-danger">Non-Sellable: 1</p>
</option>
  <option value="4">Inforcer</option>
  <option value="5">Liss Unlimited</option>
  <option value="6">Metal Detox</option>
  <option value="7">Scalp Advance </option>
  <option value="8">Silver</option>
  <option value="9">Vitamino Color</option>
  <option value="10">Biolage</option>
  <option value="11">Premium Series</option>
</select>
                    </div>
                </div>
                <div className="row">
                  <div className="col-auto border">
                    <div>
                      <h6>Sellable Items</h6>
                    </div>
                    <div>
                      <table className="table table-striped table-bordered">
                        <thead className="thead-dark">
                          <tr>
                            <th style={{ width: "15%" }}></th>
                            <th style={{ width: "50%" }}>Product Name</th>
                            <th style={{ width: "15%" }}>Price</th>
                            <th style={{ width: "20%" }}>Category</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <input className="" type="checkbox" />
                            </td>
                            <td>product.product_name</td>
                            <td>product.price</td>
                            <td>product.category_name</td>
                          </tr>

                          <tr>
                            <td>
                              <input className="" type="checkbox" />
                            </td>
                            <td>product.product_name</td>
                            <td>product.price</td>
                            <td>product.category_name</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="col-auto border">
                    <div>
                      <h6>Non-Sellable Items</h6>
                    </div>
                    <div>
                      <table className="table table-striped table-bordered">
                        <thead className="thead-dark">
                          <tr>
                            <th style={{ width: "15%" }}></th>
                            <th style={{ width: "50%" }}>Product Name</th>
                            <th style={{ width: "15%" }}>Price</th>
                            <th style={{ width: "20%" }}>Category</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <input className="" type="checkbox" />
                            </td>
                            <td>product.product_name</td>
                            <td>product.price</td>
                            <td>product.category_name</td>
                          </tr>

                          <tr>
                            <td>
                              <input className="" type="checkbox" />
                            </td>
                            <td>product.product_name</td>
                            <td>product.price</td>
                            <td>product.category_name</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BundlingModal;
