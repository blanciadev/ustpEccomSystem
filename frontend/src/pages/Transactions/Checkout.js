import React, { useState, useEffect } from 'react';
import './Transaction.css';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const customerId = localStorage.getItem('customer_id');
  const authToken = localStorage.getItem('token');

  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    region: '',
    postalCode: '',
    paymentMethod: 'COD',
  });

  // Clear data on page refresh
  useEffect(() => {
    const handlePageRefresh = () => {
      localStorage.removeItem('selectedProducts'); // Clear selected products from localStorage
      setCartItems([]); // Reset cart items state
      setQuantities([]); // Reset quantities state
      setFormData({ // Reset form data
        fullName: '',
        phoneNumber: '',
        address: '',
        region: '',
        postalCode: '',
        paymentMethod: 'COD',
      });
    };

    window.addEventListener('beforeunload', handlePageRefresh);

    return () => {
      window.removeEventListener('beforeunload', handlePageRefresh); // Cleanup the event listener
    };
  }, []);

  // Clear selected products from localStorage on component mount
  useEffect(() => {
    localStorage.removeItem('selectedProducts'); // Clear selected products
  }, []);

  const savedProductsFromStorage = JSON.parse(localStorage.getItem('selectedProducts')) || [];

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (savedProductsFromStorage.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/checkout-details', {
          selectedProducts: savedProductsFromStorage.map(product => product.product_code),
          customerId: customerId // Include customerId in the request body
        }, {
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        });

        if (response.status === 200) {
          setCartItems(response.data.items);
          setQuantities(response.data.items.map(item => item.quantity || 1));
        } else {
          setError('Failed to load product details.');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [authToken, savedProductsFromStorage, customerId]);

  const validateForm = () => {
    const { fullName, phoneNumber, address, region, postalCode, paymentMethod } = formData;

    // Check if all required fields are filled
    if (!fullName || !phoneNumber || !address || !region || !postalCode || !paymentMethod) {
      return false;
    }

    return true;
  };

  const handleQuantityChange = (index, e) => {
    const newQuantity = Math.max(1, Number(e.target.value));
    if (newQuantity > cartItems[index].stock_quantity) {
      setError(`Exceeds available stock for ${cartItems[index].product_name}. Available: ${cartItems[index].stock_quantity}`);
      return;
    }
    const newQuantities = [...quantities];
    newQuantities[index] = newQuantity;
    setQuantities(newQuantities);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('All fields are required.');
      return;
    }

    try {
      const orderData = {
        customer_id: customerId,
        order_details: cartItems.map((product, index) => ({
          product_id: product.product_code,
          quantity: quantities[index],
          totalprice: product.price * quantities[index],
          payment_method: formData.paymentMethod,
        })),
        total_price: quantities.reduce((total, qty, index) => total + cartItems[index].price * qty, 0),
      };

      const response = await axios.post('http://localhost:5000/insert-order', orderData, {
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      });

      if (response.status === 201) {
        navigate('/order-success');
      } else {
        setError('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order.');
    }
  };

  const totalPrice = quantities.reduce((total, qty, index) => total + cartItems[index].price * qty, 0);

  return (
    <div className='checkout-container'>
      <Navigation />
      <div className='checkout-wrapper'>
        <h1>Checkout</h1>

        {/* Main checkout content split into two columns */}
        <div className='checkout-content'>
          {/* Left side: Address form */}
          <div className='checkout-address'>
            <h2>Shipping Information</h2>
            <form className='address-form' onSubmit={handleSubmit}>
              {error && <p className='error-message'>{error}</p>}

              <div className='form-group'>
                <label htmlFor='fullName'>Full Name:</label>
                <input
                  type='text'
                  id='fullName'
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className='form-group'>
                <label htmlFor='phoneNumber'>Phone Number:</label>
                <input
                  type='text'
                  id='phoneNumber'
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div className='form-group'>
                <label htmlFor='address'>Address:</label>
                <input
                  type='text'
                  id='address'
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className='form-group'>
                <label htmlFor='region'>Region:</label>
                <input
                  type='text'
                  id='region'
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
              </div>

              <div className='form-group'>
                <label htmlFor='postalCode'>Postal Code:</label>
                <input
                  type='text'
                  id='postalCode'
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>

              <div className='form-group'>
                <label htmlFor='paymentMethod'>Payment Method:</label>
                <select
                  id='paymentMethod'
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value='COD'>Cash on Delivery</option>
                </select>
              </div>

              <button type='submit'>Submit Order</button>
            </form>
          </div>

          {/* Right side: Cart summary */}
          <div className='cart-items-summary'>
            <h2>Order Summary</h2>
            {loading ? <p>Loading...</p> : (
              cartItems.map((item, index) => (
                <div key={item.product_code} className='cart-item'>
                  <p>{item.product_name}</p>
                  <p>Price: ${item.price}</p>
                  <p>Stock: {item.stock_quantity}</p>
                  <input
                    type='number'
                    value={quantities[index]}
                    onChange={(e) => handleQuantityChange(index, e)}
                    min='1'
                  />
                </div>
              ))
            )}
            <h3>Total Price: ${totalPrice.toFixed(2)}</h3>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
