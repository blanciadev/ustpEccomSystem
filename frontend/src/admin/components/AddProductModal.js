import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ToastNotification from "../../public/components/ToastNotification";
import "./modal.css";

const AddProductModal = ({ show, handleClose, handleSubmit }) => {
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
                const response = await fetch("https://ustp-eccom-server.vercel.app/api/product-category");
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

        const customerId = localStorage.getItem('customer_id');

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

        console.log("Image URL before submission:", imageURL);

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
            const response = await fetch("https://ustp-eccom-server.vercel.app/api/add-product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const result = await response.text();
            console.log(result);

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
                    <div className="modal-content">
                        <div className="modal-header order-head">
                            <h5 className="modal-title">
                                <i className="bx bxs-package"></i> Add Products
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
                                <form onSubmit={handleFormSubmit}>
                                    {/* Product Name */}
                                    <div className="form-group row mb-3">
                                        <label
                                            htmlFor="productName"
                                            className="col-sm-3 col-form-label"
                                        >
                                            Product Name
                                        </label>
                                        <div className="col-sm-9">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="productName"
                                                placeholder="Enter product name"
                                                value={productName}
                                                onChange={(e) => setProductName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="form-group row mb-3">
                                        <label
                                            htmlFor="description"
                                            className="col-sm-3 col-form-label"
                                        >
                                            Description
                                        </label>
                                        <div className="col-sm-9">
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                rows="3"
                                                placeholder="Enter product description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="form-group row mb-3">
                                        <label
                                            htmlFor="category"
                                            className="col-sm-3 col-form-label"
                                        >
                                            Category
                                        </label>
                                        <div className="col-sm-9">
                                            <select
                                                className="form-select"
                                                id="category"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                required
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.category_id} value={cat.category_id}>
                                                        {cat.category_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="form-group row mb-3">
                                        <label htmlFor="price" className="col-sm-3 col-form-label">
                                            Price
                                        </label>
                                        <div className="col-sm-9">
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="price"
                                                placeholder="Enter price"
                                                step="0.01"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="form-group row mb-3">
                                        <label
                                            htmlFor="quantity"
                                            className="col-sm-3 col-form-label"
                                        >
                                            Quantity
                                        </label>
                                        <div className="col-sm-9">
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="quantity"
                                                placeholder="Enter quantity"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Expiration Date */}
                                    <div className="form-group row mb-3">
                                        <label
                                            htmlFor="expirationDate"
                                            className="col-sm-3 col-form-label"
                                        >
                                            Expiration Date
                                        </label>
                                        <div className="col-sm-9">
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="expirationDate"
                                                value={expirationDate}
                                                onChange={(e) => setExpirationDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Size */}
                                    <div className="form-group row mb-3">
                                        <label htmlFor="size" className="col-sm-3 col-form-label">
                                            Size
                                        </label>
                                        <div className="col-sm-9">
                                            <select
                                                className="form-select"
                                                id="size"
                                                value={size}
                                                onChange={(e) => {
                                                    setSize(e.target.value);
                                                    if (e.target.value !== "Other") {
                                                        setCustomSize("");
                                                    }
                                                }}
                                                required
                                            >
                                                <option value="">Select size</option>
                                                <option value="500">500</option>
                                                <option value="100">100</option>
                                                <option value="250">250</option>
                                                <option value="300">300</option>
                                                <option value="150">150</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {size === "Other" && (
                                                <input
                                                    type="text"
                                                    className="form-control mt-2"
                                                    placeholder="Enter custom size"
                                                    value={customSize}
                                                    onChange={(e) => setCustomSize(e.target.value)}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Image */}
                                    <div className="form-group row mb-3">
                                        <label
                                            htmlFor="productImage"
                                            className="col-sm-3 col-form-label"
                                        >
                                            Product URL
                                        </label>
                                        <div className="col-sm-9">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="productImage"
                                                placeholder="Enter product URL"
                                                value={imageURL}
                                                onChange={(e) => setImageURL(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="form-group ">
                                        <div className="col-sm-9 offset-sm-3">
                                            <div className="d-flex justify-content-start mt-2">
                                                <button
                                                    type="submit"
                                                    className="btn-lg btn-primary"
                                                    style={{ width: "310px" }}
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddProductModal;