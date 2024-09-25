import React, { useState, useEffect } from 'react';
import './Transaction.css';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const customerId = localStorage.getItem('customer_id');
  const authToken = localStorage.getItem('token');

  const savedProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
  const [quantities, setQuantities] = useState(savedProducts.map(product => product.quantity || 1));
  const [originalQuantities, setOriginalQuantities] = useState([]);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    region: '',
    postalCode: '',
    paymentMethod: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (savedProducts.length > 0) {
      const fetchOriginalQuantities = async () => {
        const quantities = await Promise.all(
          savedProducts.map(product =>
            axios.get(`http://localhost:5000/products/${product.product_code}`)
              .then(response => response.data.quantity)
          )
        );
        setOriginalQuantities(quantities);
      };
      fetchOriginalQuantities();
    }

    const handleBeforeUnload = () => {
      localStorage.removeItem('selectedProducts');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [savedProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePaymentChange = (e) => {
    setFormData({
      ...formData,
      paymentMethod: e.target.value,
    });
  };

  const handleQuantityChange = (index, e) => {
    const newQuantity = Math.max(1, Number(e.target.value));

    if (newQuantity > originalQuantities[index]) {
      setError(`Quantity exceeds available stock for ${savedProducts[index].product_name}. Available: ${originalQuantities[index]}`);
      return;
    }

    const newQuantities = [...quantities];
    newQuantities[index] = newQuantity;
    setQuantities(newQuantities);
    setError('');
  };

  const validateForm = () => {
    const { fullName, phoneNumber, address, region, postalCode, paymentMethod } = formData;
    return fullName && phoneNumber && address && region && postalCode && paymentMethod;
  };

  const handleRemoveProduct = (index) => {
    // Remove the product from savedProducts and quantities
    const updatedProducts = [...savedProducts];
    const updatedQuantities = [...quantities];

    updatedProducts.splice(index, 1);
    updatedQuantities.splice(index, 1);

    setQuantities(updatedQuantities);

    // Update localStorage with the new list of selected products
    localStorage.setItem('selectedProducts', JSON.stringify(updatedProducts));

    // Remove from localStorage if no products are left
    if (updatedProducts.length === 0) {
      localStorage.removeItem('selectedProducts');
    }

    // Update savedProducts state so the component re-renders with the updated list
    setOriginalQuantities(updatedQuantities);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      setError('All fields are required.');
      return;
    }

    try {
      if (!customerId || savedProducts.length === 0) {
        setLoading(false);
        setError('Missing customer ID or no products selected.');
        return;
      }

      const orderData = {
        customer_id: customerId,
        order_details: savedProducts.map((product, index) => ({
          product_id: product.product_code,
          quantity: quantities[index],
          totalprice: product.price * quantities[index],
          payment_method: formData.paymentMethod,
          payment_status: 'Pending',
        })),
        total_price: quantities.reduce((total, qty, index) => total + (savedProducts[index].price * qty), 0),
        order_date: new Date().toISOString(),
      };

      const response = await axios.post('http://localhost:5000/insert-order', orderData, {
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      });

      if (response.status === 201) {
        setSuccess('Order placed successfully!');
        localStorage.removeItem('selectedProducts');
        navigate('/order-success');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price only if there are products, otherwise set to 0
  const totalPrice = savedProducts.length > 0
    ? quantities.reduce((total, qty, index) => total + (savedProducts[index]?.price * qty), 0)
    : 0;

  return (
    <div className='checkout-container'>
      <Navigation />
      <div className='checkout-wrapper'>
        <h1>Checkout</h1>
        <div className='checkout-content'>
          <div className='checkout-address'>
            <h3>Delivery Address</h3>
            <form className='address-form' onSubmit={handleSubmit}>
              {error && <p className='error-message'>{error}</p>}
              {success && <p className='success-message'>{success}</p>}
              {['fullName', 'phoneNumber', 'address', 'region', 'postalCode'].map(field => (
                <div className='form-group' key={field}>
                  <label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
                  <input
                    type='text'
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              ))}
              <div className='form-group'>
                <h3>Payment Method</h3>
                <label>
                  <input
                    type='radio'
                    name='paymentMethod'
                    value='COD'
                    checked={formData.paymentMethod === 'COD'}
                    onChange={handlePaymentChange}
                  />
                  Cash On Delivery
                </label>
                <label>
                  <input
                    type='radio'
                    name='paymentMethod'
                    value='Credit/Debit Card'
                    checked={formData.paymentMethod === 'Credit/Debit Card'}
                    onChange={handlePaymentChange}
                  />
                  Credit/Debit Card
                </label>
              </div>
              <div className='form-group'>
                <button type='submit' className='submit-btn' disabled={loading}>
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
          <div className='checkout-summary'>
            <h3>Order Summary</h3>
            <div className='summary-header'>
              <span>Item</span>
              <span>Quantity</span>
              <span>Total Price</span>
              <span>Remove</span>
            </div>
            <ul className="product-list">
              {savedProducts.length > 0 ? (
                savedProducts.map((product, index) => (
                  <li key={product.product_code}>
                    <span>{product.product_name}</span>
                    <input
                      type="number"
                      min="1"
                      max={originalQuantities[index]}
                      value={quantities[index]}
                      onChange={(e) => handleQuantityChange(index, e)}
                    />
                    <span>₱{(product.price * quantities[index]).toFixed(2)}</span>
                    <button className='remove-btn' onClick={() => handleRemoveProduct(index)}>Remove</button>
                  </li>
                ))
              ) : (
                <p>No products selected.</p>
              )}
            </ul>
            <h4>Total Price: ₱{totalPrice.toFixed(2)}</h4>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
