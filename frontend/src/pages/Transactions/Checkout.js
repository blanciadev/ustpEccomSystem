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

  const globalDiscounts = JSON.parse(localStorage.getItem('globalDiscounts')) || [];

  // console.log(globalDiscounts);

  const [discounts, setDiscounts] = useState([]);

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
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Check if the user is logged in by checking the token
    const token = localStorage.getItem('token');

    // if (!token) {
    //   // If no token, redirect to the login page
    //   navigate('/login');
    //   return;
    // }

    if (savedProducts.length > 0 && !hasFetched) {
      const fetchOriginalQuantities = async () => {
        try {
          const productData = await Promise.all(
            savedProducts.map(product =>
              axios
                .get(`http://localhost:5001/products-checkout/${product.product_code}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
                .then(response => response.data)
            )
          );

          const productQuantities = productData.map(item => item.quantity);
          setOriginalQuantities(productQuantities);

          // Retrieve discounts directly from saved products
          const productDiscounts = savedProducts.map(product => product.discount || 0);
          setDiscounts(productDiscounts); // Store the retrieved discounts

          setHasFetched(true);
        } catch (error) {
          console.error('Error fetching quantities and discounts:', error);
        }
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
  }, [savedProducts, hasFetched]);



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

      // Use the calculateTotalPrice function to get the total price
      const totalOrderPrice = calculateTotalPrice().toFixed(2);

      const orderData = {
        customer_id: customerId,
        fullName: formData.fullName,

        // Map through savedProducts to calculate individual product totals with discount
        order_details: savedProducts.map((product, index) => {
          const discountedPrice = product.price * (1 - (discounts[index] / 100)); // Apply discount
          const productTotal = discountedPrice * quantities[index]; // Calculate total for the product

          return {
            cart_items: product.cart_items_id,
            product_id: product.product_code,
            quantity: quantities[index],
            totalprice: productTotal.toFixed(2), // Store discounted total price
            payment_method: 'COD',
            payment_status: 'Pending',
          };
        }),

        // Use the calculated total price
        total_price: totalOrderPrice, // Correctly reference totalOrderPrice here

        order_date: new Date().toISOString(),
        shipment_date: new Date().toISOString(),
        address: formData.address,
        region: formData.region,
        shipment_status: 'Pending',
        paymentMethod: formData.paymentMethod,
        phoneNumber: formData.phoneNumber,
        postalCode: formData.postalCode,
      };

      console.log(orderData);

      const response = await axios.post('http://localhost:5001/insert-order', orderData, {
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      });

      // Save orderData to localStorage (if needed)
      localStorage.setItem('checkoutOrderData', JSON.stringify(orderData));

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


  const calculateTotalPrice = () => {
    // Helper function to check if all elements in an array are equal
    const allValuesEqual = (array) => {
      if (array.length === 0) return true; // An empty array is considered equal
      return array.every(value => value === array[0]);
    };

    let discounts = globalDiscounts;

    // If there are no products, return 0
    if (savedProducts.length === 0) return 0;

    // If all discounts are the same, use the first value; otherwise, keep as an array
    const effectiveDiscount = allValuesEqual(discounts) ? discounts[0] : discounts;

    const productTotal = savedProducts.reduce((acc, product, index) => {
      let effectivePrice;

      // Check if the product has a discounted price
      if (product.discounted_price) {
        // Use the discounted price for total calculation
        effectivePrice = product.discounted_price;
      } else {
        // Calculate the discount if there is no discounted price
        const discount = Array.isArray(effectiveDiscount) ? effectiveDiscount[index] || 0 : effectiveDiscount;
        effectivePrice = product.price * (1 - (discount / 100)); // Apply discount for regular products
      }

      // Calculate the total for this product based on the effective price
      const totalForProduct = effectivePrice * (quantities[index] || 0); // Default to 0 if quantity is undefined
      console.log(totalForProduct);
      return acc + totalForProduct;
    }, 0);

    const shippingFee = 150;
    const transactionTotal = productTotal + shippingFee;

    return Math.round(transactionTotal);
  };







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
              </div>
              <div className='form-group'>
                <button type='submit' className='submit-btn' disabled={loading}>
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
          <div className='checkout-summary' style={{
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
            fontFamily: 'Arial, sans-serif'
          }}>
            <h3 style={{
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#333'
            }}>Order Summary</h3>

            <div className='summary-header' style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr',
              fontWeight: 'bold',
              padding: '10px 0',
              borderBottom: '2px solid #f0f0f0',
              color: '#555'
            }}>
              <span>ID</span>
              <span>Product Name</span>
              <span>Quantity</span>
              <span>Discount</span>
              <span>Total Price</span>
              <span>Action</span>
            </div>

            <ul className="product-list" style={{ listStyle: 'none', padding: '0', marginTop: '10px' }}>
  {savedProducts.length > 0 ? (
    savedProducts.map((product, index) => {
      // Check if the product has a discounted price, otherwise calculate the discount for unbundled items
      const isBundled = product.discounted_price != null;
      const effectivePrice = isBundled ? product.discounted_price : product.price * (1 - (discounts[index] / 100));
      const productTotal = effectivePrice * quantities[index]; // Calculate total for this product

      // Calculate the discount percentage, even for unbundled items
      const discountPercentage = isBundled
        ? ((product.price - product.discounted_price) / product.price) * 100
        : discounts[index] || 0;

      return (
        <li
          key={product.product_code}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr',
            alignItems: 'center',
            padding: '15px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            marginBottom: '10px',
            backgroundColor: '#f8f9fa',
          }}
        >
          <span style={{ marginRight: '10px', fontSize: '14px' }}>
            {product.cart_items_id}
          </span>
          <span style={{ fontWeight: 'bold', marginRight: '10px', color: '#333' }}>
            {product.product_name}
          </span>

          {/* Quantity Input */}
          <input
            type="number"
            min="1"
            max={originalQuantities[index]}
            value={quantities[index]}
            onChange={(e) => handleQuantityChange(index, e)}
            style={{
              width: '60px',
              padding: '5px',
              textAlign: 'center',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />

          {/* Discount status */}
          <p style={{ margin: '5px 0', fontSize: '14px', color: discountPercentage > 0 ? '#28a745' : '#555' }}>
            {discountPercentage > 0 ? `${discountPercentage.toFixed(2)}% off` : ''}
          </p>

          {/* Total price calculation */}
          <span style={{ fontWeight: 'bold', color: '#333' }}>
            {/* Render original price with line-through if there is a discount */}
            <span style={{ textDecoration: discountPercentage > 0 ? 'line-through' : 'none' }}>
              ₱{(product.price * quantities[index]).toFixed(2)}
            </span>
            {/* Render discounted price if there is a discount */}
            {discountPercentage > 0 ? (
              <> ➔ ₱{productTotal.toFixed(2)}</>
            ) : null}
          </span>

          {/* Remove button */}
          <button
            className="remove-btn"
            onClick={() => handleRemoveProduct(index)}
            style={{
              marginLeft: '10px',
              backgroundColor: '#ff4d4d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </li>
      );
    })
  ) : (
    <li>No products selected.</li>
  )}
</ul>





            <h3 style={{
              textAlign: 'right',
              fontSize: '18px',
              marginTop: '20px',
              fontWeight: 'bold',
              color: '#333'
            }}>Shipping Total: ₱150</h3>

            <h4 style={{
              textAlign: 'right',
              fontSize: '20px',
              marginTop: '10px',
              fontWeight: 'bold',
              color: '#007bff'
            }}>Total Price: ₱{(calculateTotalPrice())}</h4>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

};

export default Checkout;
