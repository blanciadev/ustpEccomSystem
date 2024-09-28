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
  console.log('Customer ID:', customerId);

  // Retrieve from local storage
  const savedProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
  const totalPrice = location.state?.totalPrice || JSON.parse(localStorage.getItem('totalPrice')) || 0;

  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
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

  // Manage quantities of saved products
  const [quantities, setQuantities] = useState(savedProducts.map(product => product.quantity));

  // Clear local storage data on page close
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('selectedProducts');
      localStorage.removeItem('totalPrice');
      localStorage.removeItem('checkoutFormData');
      localStorage.removeItem('checkoutOrderData');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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
    const newQuantity = Number(e.target.value);
    if (newQuantity <= savedProducts[index].quantity) {
      const newQuantities = [...quantities];
      newQuantities[index] = newQuantity;
      setQuantities(newQuantities);
    }
  };

  const validateForm = () => {
    const { fullName, phoneNumber, address, region, postalCode, paymentMethod } = formData;
    if (!fullName || !phoneNumber || !address || !region || !postalCode || !paymentMethod) {
      return 'All fields are required.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setLoading(false);
      setError(validationError);
      return;
    }

    try {
      if (!customerId) {
        setLoading(false);
        setError('Customer ID is missing.');
        return;
      }

      // Check if selectedProducts and totalPrice are available
      if (savedProducts.length === 0 || totalPrice <= 0) {
        setLoading(false);
        setError('No products selected or total price is invalid.');
        return;
      }

      // Save formData to localStorage
      localStorage.setItem('checkoutFormData', JSON.stringify(formData));

      const orderData = {
        customer_id: customerId,
        order_date: new Date().toISOString(),
        order_details: savedProducts.map((product, index) => ({
          product_id: product.product_code,
          quantity: quantities[index],
          totalprice: product.price * quantities[index],
          payment_date: new Date().toISOString(),
          payment_method: formData.paymentMethod,
          payment_status: 'Pending',
        })),
        total_price: quantities.reduce((total, qty, index) => total + (savedProducts[index].price * qty), 0),
      };

      // Save orderData to localStorage (if needed)
      localStorage.setItem('checkoutOrderData', JSON.stringify(orderData));

      const response = await axios.post(
        'http://localhost:5001/insert-order',
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        setSuccess('Order placed successfully!');
        navigate('/order-success');
      }
    } catch (error) {
      console.error('Error placing order:', error.message);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='checkout-container'>
      <Navigation />
      <div className='checkout-wrapper'>
        <h1>Checkout</h1>
        <div className='checkout-content'>
          <div className='checkout-address'>
            <h3>Delivery Address</h3>
            <button className='change-address-btn'>Change</button>
            <form className='address-form' onSubmit={handleSubmit}>
              {error && <p className='error-message'>{error}</p>}
              {success && <p className='success-message'>{success}</p>}
              <div className='form-group'>
                <label htmlFor='fullName'>Full Name</label>
                <input
                  type='text'
                  id='fullName'
                  name='fullName'
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='form-group'>
                <label htmlFor='phoneNumber'>Phone Number</label>
                <input
                  type='text'
                  id='phoneNumber'
                  name='phoneNumber'
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='form-group'>
                <label htmlFor='address'>Street Name, Building, House Number</label>
                <input
                  type='text'
                  id='address'
                  name='address'
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='form-group'>
                <label htmlFor='region'>Region, Province, City, Barangay</label>
                <input
                  type='text'
                  id='region'
                  name='region'
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='form-group'>
                <label htmlFor='postalCode'>Postal Code</label>
                <input
                  type='text'
                  id='postalCode'
                  name='postalCode'
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='form-group'>
                <h3>Payment Method</h3>
                <div className='payment-options'>
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
            </div>
            <ul className='product-list'>
              {savedProducts.length > 0 ? (
                savedProducts.map((product, index) => (
                  <li key={product.product_code}>
                    <span>{product.product_name}</span>
                    <input
                      type='number'
                      min='1'
                      max={product.quantity}
                      value={quantities[index]}
                      onChange={(e) => handleQuantityChange(index, e)}
                    />
                    <span className='total-price'>₱{product.price * quantities[index]}</span>
                  </li>
                ))
              ) : (
                <p>No products selected.</p>
              )}
            </ul>
            <br />
            <h4>Total: ₱ {quantities.reduce((total, qty, index) => total + (savedProducts[index].price * qty), 0)}</h4>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
