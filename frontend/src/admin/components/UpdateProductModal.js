import React, { useState, useEffect } from 'react';
import './modal.css';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import ToastNotification from '../../public/components/ToastNotification';
const UpdateProductModal = ({ show, product, handleClose, handleUpdate }) => {
    const [formData, setFormData] = useState({
        product_code: '',
        product_name: '',
        price: '',
        category_id: '',
        category_name: '',
        quantity: '',
        description: '',
        product_image: '',
        size: '',
        custom_size: '',
        expiration_date: ''
    });
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                product_code: product.product_code || '',
                product_name: product.product_name || '',
                price: product.price || '',
                category_id: product.category_id || '',
                category_name: product.category_name || '',
                quantity: product.quantity || '',
                description: product.description || '',
                product_image: product.product_image || '',
                size: product.size || '',
                custom_size: product.size && !['500', '100', '150', '200', '250'].includes(product.size) ? product.size : '', // Handle custom size
                expiration_date: formatDate(product.expiration_date) || ''
            });
        }

        const fetchCategories = async () => {
            try {
                const response = await axios.get('https://ustp-eccom-server.vercel.app/api/categories');
                setCategories(response.data.categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories.');
            }
        };

        fetchCategories();
    }, [product]);

    const formatDate = (datetime) => {
        if (!datetime) return "";
        const date = new Date(datetime);
        return date.toISOString().split("T")[0];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: name === 'expiration_date' ? formatDate(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.product_code) {
                const dataToSend = {
                    ...formData,
                    size: formData.size === 'Other' ? formData.custom_size : formData.size
                };
                await axios.put(`https://ustp-eccom-server.vercel.app/api/admin-update-products/${formData.product_code}`, dataToSend);

                setToastMessage('Updated Successfully!');
                setTimeout(() => {
                    handleUpdate();
                    handleClose();
                }, 2000);
            } else {
                console.error('Product code is undefined');
                setError('Product code is missing.');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            setError('Failed to update product. Please try again.');
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
                                <i className="bx bxs-package"></i> Update Product
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
                                <form onSubmit={handleSubmit}>


                                    {/* Product Image */}
                                    <div className="form-group row mb-3" style={{ width: "300px", height: "300px" }}>

                                        <img src={product.product_image} alt="Product" />

                                    </div>




                                    {/* Product Code */}
                                    <div className="form-group row mb-3">
                                        <label
                                            htmlFor="product_code"
                                            className="col-sm-3 col-form-label"
                                        >
                                            Product Code
                                        </label>
                                        <div className="col-sm-9">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="product_code"
                                                value={formData.product_code}
                                                onChange={handleChange}
                                                required
                                                readOnly
                                            />
                                        </div>
                                    </div>



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
                                                name="product_name"
                                                value={formData.product_name}
                                                onChange={handleChange}
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
                                                name="description"
                                                rows="3"

                                                value={formData.description}
                                                onChange={handleChange}
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
                                                name="category_id"
                                                value={formData.category_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">
                                                    {formData.category_name ? `${formData.category_name}` : 'Select a category'}
                                                </option>
                                                {categories.map((category) => (
                                                    <option key={category.category_id} value={category.category_id}>
                                                        {category.category_name}
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
                                                step="0.01"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
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
                                                name="quantity"
                                                placeholder="Enter quantity"
                                                min="1"
                                                value={formData.quantity}
                                                onChange={handleChange}
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
                                                id="expiration_date"
                                                name="expiration_date"
                                                value={formatDate(formData.expiration_date)}
                                                onChange={handleChange}
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
                                                name="size"
                                                value={formData.size}
                                                onChange={handleChange}
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
                                            {formData.size === 'Other' && (
                                                <input
                                                    type="text"
                                                    className="form-control mt-2"
                                                    name="custom_size"
                                                    value={formData.custom_size}
                                                    onChange={handleChange}
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
                                                id="product_image"
                                                name="product_image"
                                                value={formData.product_image}
                                                onChange={handleChange}
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
                                                    Update Product
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

export default UpdateProductModal;
