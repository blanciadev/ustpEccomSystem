import React, { useState, useEffect } from 'react';
import './Transaction.css';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ToastNotification from '../../components/ToastNotification';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const customerId = localStorage.getItem('customer_id');
  const authToken = localStorage.getItem('token');

  const globalDiscounts = JSON.parse(localStorage.getItem('globalDiscounts')) || [];

  const [discounts, setDiscounts] = useState([]);
  const savedProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
  const [quantities, setQuantities] = useState(savedProducts.map(product => product.quantity || 1));
  const [originalQuantities, setOriginalQuantities] = useState([]);

  let effectiveGlobalDiscount = 0;

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    streetname: '',
    address: '',
    region: '',
    postalCode: '',
    paymentMethod: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasFetched, setHasFetched] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (savedProducts.length > 0 && !hasFetched) {
      const fetchOriginalQuantities = async () => {
        try {
          const productData = await Promise.all(
            savedProducts.map(product =>
              axios.get(`http://localhost:5001/products-checkout/${product.product_code}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }).then(response => response.data)
            )
          );

          const productQuantities = productData.map(item => item.quantity);
          setOriginalQuantities(productQuantities);
          const productDiscounts = savedProducts.map(product => product.discount || 0);
          setDiscounts(productDiscounts);
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
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePaymentChange = (e) => {
    setFormData(prevData => ({
      ...prevData,
      paymentMethod: e.target.value,
    }));
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
    const { fullName, phoneNumber, streetname, address, region, postalCode, paymentMethod } = formData;
    return fullName && phoneNumber && streetname && address && region && postalCode && paymentMethod;
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...savedProducts];
    const updatedQuantities = [...quantities];

    updatedProducts.splice(index, 1);
    updatedQuantities.splice(index, 1);

    setQuantities(updatedQuantities);
    localStorage.setItem('selectedProducts', JSON.stringify(updatedProducts));

    if (updatedProducts.length === 0) {
      localStorage.removeItem('selectedProducts');
      setToastMessage('Redirecting to Cart');
      setTimeout(() => {
        setToastMessage('');

        navigate('/cart')
      }, 3000);
    }

    setOriginalQuantities(updatedQuantities);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');
  //   setSuccess('');
  //   const userId = localStorage.getItem('customer_id');
  //   const payload = {};
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     localStorage.setItem('redirectTo', '/checkout');
  //     navigate('/login');
  //     return;
  //   }

  //   if (!validateForm()) {
  //     setLoading(false);
  //     setError('All fields are required.');
  //     return;
  //   }


  //   try {
  //     if (!customerId || savedProducts.length === 0) {
  //       setLoading(false);
  //       setError('Missing customer ID or no products selected.');
  //       return;
  //     }
  //     // Define the interaction payload
  //     payload = {
  //       product_code: savedProducts.map(product => product.product_code),
  //       customerId: userId,
  //       interaction_type: 'order'
  //     };

  //     console.log("Payload Entry : ", payload);

  //     const totalOrderPrice = calculateTotalPrice().toFixed(2);
  //     const orderData = {
  //       customer_id: customerId,
  //       fullName: formData.fullName,
  //       order_details: savedProducts.map((product, index) => {
  //         const discountedPrice = product.price * (1 - (discounts[index] / 100));
  //         const productTotal = discountedPrice * quantities[index];

  //         return {
  //           cart_items: product.cart_items_id,
  //           product_id: product.product_code,
  //           quantity: quantities[index],
  //           totalprice: productTotal.toFixed(2),
  //           payment_method: 'COD',
  //           payment_status: 'Pending',
  //         };
  //       }),
  //       total_price: totalOrderPrice,
  //       order_date: new Date().toISOString(),
  //       shipment_date: new Date().toISOString(),
  //       address: formData.address,
  //       streetname: formData.streetname,
  //       region: formData.region,
  //       shipment_status: 'Pending',
  //       paymentMethod: formData.paymentMethod,
  //       phoneNumber: formData.phoneNumber,
  //       postalCode: formData.postalCode,
  //     };

  //     const response = await axios.post('http://localhost:5001/insert-order', orderData, {
  //       headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  //     });

  //     localStorage.setItem('checkoutOrderData', JSON.stringify(orderData));

  //     if (response.status === 201) {

  //       setSuccess('Order placed successfully!');
  //       localStorage.removeItem('selectedProducts');

  //       setToastMessage('Order Successful!');
  //       setTimeout(() => {
  //         setToastMessage('');
  //         navigate('/user/purchase');
  //       }, 3000);

  //       console.log('toast should display T-T')


  //     }
  //   } catch (error) {
  //     console.error('Error placing order:', error);
  //     setError('Failed to place order. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  //   // Function to record product interaction
  //   const recordProductInteraction = async (payload) => {
  //     try {
  //       console.log('Recording product interaction:', payload);
  //       await axios.get('http://localhost:5001/products-interaction', { params: payload });
  //       console.log('Product interaction recorded successfully.');
  //     } catch (error) {
  //       console.error('Error recording product interaction:', error);
  //     }
  //   };

  //   await recordProductInteraction(payload);

  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const customerId = localStorage.getItem('customer_id');
    const token = localStorage.getItem('token');

    // Redirect to login if token is missing
    if (!token) {
      localStorage.setItem('redirectTo', '/checkout');
      navigate('/login');
      return;
    }

    // Validate the form before proceeding
    if (!validateForm()) {
      setLoading(false);
      setError('All fields are required.');
      return;
    }

    // Check for customerId and selected products
    if (!customerId || savedProducts.length === 0) {
      setLoading(false);
      setError('Missing customer ID or no products selected.');
      return;
    }


    const totalOrderPrice = calculateTotalPrice().toFixed(2);

    const orderData = {
      customer_id: customerId,
      fullName: formData.fullName,
      order_details: savedProducts.map((product, index) => {
        const discountedPrice = product.price * (1 - (discounts[index] / 100));
        const productTotal = discountedPrice * quantities[index];
        return {
          cart_items: product.cart_items_id,
          product_id: product.product_code,
          quantity: quantities[index],
          totalprice: productTotal.toFixed(2),
          payment_method: 'COD',
          payment_status: 'Pending',
        };
      }),
      total_price: totalOrderPrice,
      order_date: new Date().toISOString(),
      shipment_date: new Date().toISOString(),
      address: formData.address,
      streetname: formData.streetname,
      region: formData.region,
      shipment_status: 'Pending',
      paymentMethod: formData.paymentMethod,
      phoneNumber: formData.phoneNumber,
      postalCode: formData.postalCode,
    };

    // Define the interaction payload
    const payload = {
      product_code: orderData.order_details.map(detail => detail.product_id),  // retrieve product_id from order_details in orderData
      customerId: customerId,
      interaction_type: 'order'
    };

    console.log("Payload Entry:", payload);

    try {
      // Send order data to the server
      const response = await axios.post('http://localhost:5001/insert-order', orderData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      localStorage.setItem('checkoutOrderData', JSON.stringify(orderData));

      if (response.status === 201) {
        setSuccess('Order placed successfully!');
        localStorage.removeItem('selectedProducts');

        setToastMessage('Order Successful!');
        setTimeout(() => {
          setToastMessage('');
          navigate('/user/purchase');
        }, 3000);

        console.log('Toast should display T-T');

        await recordProductInteraction(payload);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const recordProductInteraction = async (payload) => {
    try {
      console.log('Recording product interaction:', payload);
      await axios.get('http://localhost:5001/products-interaction', { params: payload });
      console.log('Product interaction recorded successfully.');
    } catch (error) {
      console.error('Error recording product interaction:', error);
    }
  };


  const calculateTotalPrice = () => {
    const allValuesEqual = (array) => array.length === 0 || array.every(value => value === array[0]);

    const getEffectivePrice = (basePrice, discount) => {
      const discountMultiplier = 1 - (discount / 100 || 0);
      return basePrice * discountMultiplier;
    };

    if (savedProducts.length === 0) return 0;

    console.log("----- Receipt -----");

    let totalCost = 0;
    const generalDiscount = allValuesEqual(globalDiscounts) ? globalDiscounts[0] : 0;
    const hasGeneralDiscount = generalDiscount > 0;
    console.log("----- GENERAL DISCOUNT  -----");
    console.log(effectiveGlobalDiscount);


    savedProducts.forEach((product, index) => {
      const quantity = quantities[index] || 0;
      let effectivePrice = 0;
      let discountApplied = 0;

      console.log(hasGeneralDiscount);

      if (product.discounted_price) {
        discountApplied = allValuesEqual(globalDiscounts) ? globalDiscounts[0] : 0;
        effectivePrice = getEffectivePrice(product.discounted_price, discountApplied);

        console.log(`Product: ${product.product_name} (Discounted)`);
      } else {
        discountApplied = hasGeneralDiscount ? generalDiscount : 0;
        effectivePrice = getEffectivePrice(product.price, discountApplied);

        console.log(`Product: ${product.product_name} (Non-Bundled)`);
      }

      console.log(`  Discount: ${discountApplied}%`);
      console.log(`  Price per unit: $${effectivePrice.toFixed(2)}`);
      console.log(`  Quantity: ${quantity}`);

      const totalForProduct = effectivePrice * quantity;
      totalCost += totalForProduct;

      console.log(`  Total for ${product.product_name}: $${totalForProduct.toFixed(2)}`);
      console.log("------------------------------");
    });

    const shippingCost = 150;
    const transactionTotal = totalCost + shippingCost;

    console.log(`Subtotal: $${totalCost.toFixed(2)}`);
    console.log(`Shipping: $${shippingCost.toFixed(2)}`);
    console.log(`Transaction Total: $${transactionTotal.toFixed(2)}`);
    console.log("----- End of Receipt -----");

    return transactionTotal;
  };







  const getDiscountedPrice = (price, discount) => {
    return price * (1 - (discount / 100));
  };

  const formatPhoneNumber = (input) => {
    const formattedInput = input.replace(/\D/g, "");
    const phonePrefix = "+639";
    const mainNumber = formattedInput.slice(3);

    return mainNumber.length > 0
      ? `${phonePrefix} ${mainNumber.slice(0, 3)} ${mainNumber.slice(3, 6)} ${mainNumber.slice(6, 9)}`
      : phonePrefix;
  };

  const handlePhoneNumberChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");

    if (!input.startsWith("639")) {
      input = "639" + input;
    }

    setFormData({ ...formData, phoneNumber: `+${input}` });
  };

  const formatPhoneNumberOnBlur = () => {
    const formattedPhone = formatPhoneNumber(formData.phoneNumber);
    setFormData({ ...formData, phoneNumber: formattedPhone });
  };


  const handlePostalCodeChange = (e) => {
    const numericPostalCode = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, postalCode: numericPostalCode });
  };

  return (
    <div className='checkout-container'>
      <ToastNotification toastMessage={toastMessage} />
      <Navigation />
      <div className='checkout-wrapper'>
        <h1><i class='bx bxs-shopping-bag'></i>Checkout</h1>
        <div className='checkout-content'>
          <div className='checkout-address'>
            <h3>Delivery Address</h3>
            <form class="address-form" onSubmit={handleSubmit}>

              <div class="form-group">
                <label for="fullName">FULL NAME</label>
                <input type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">PHONE NUMBER</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handlePhoneNumberChange}
                  onBlur={formatPhoneNumberOnBlur}
                  maxLength="13"
                  placeholder="+639 XXX XXX XXX"
                  required
                />
              </div>

              <div class="form-group">
                <label for="streetname">STREETNAME</label>
                <input type="text"
                  id="streetname"
                  name="streetname"
                  value={formData.streetname}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div class="form-group">
                <label for="address">ADDRESS</label>
                <input type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div class="form-group">
                <label for="region">REGION</label>
                <input type="text"
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">POSTAL CODE</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handlePostalCodeChange}
                  maxLength="4"
                  placeholder="e.g., 1234"
                  required
                />
              </div>

              <div class="form-group">
                <h6>Payment Method: Cash On Delivery (COD)</h6>
                  <input type="hidden"
                    name="paymentMethod"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={handlePaymentChange}
                    value="COD" />
              </div>

              <div className='form-group'>
                <button type='submit' className='submit-btn' disabled={loading}>
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>

            </form>

            {/* <form className='address-form' onSubmit={handleSubmit}>
              {error && <p className='error-message'>{error}</p>}
              {success && <p className='success-message'>{success}</p>}
              {['fullName', 'phoneNumber', 'streetname', 'address', 'region', 'postalCode'].map(field => (
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
            </form> */}
          </div>
          <div className='checkout-summary' style={{
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3>Order Summary</h3>
            {savedProducts.map((product, index) => {
              const effectiveDiscount = product.discount || 0; // Check product-specific discount
              const discountedPrice = getDiscountedPrice(product.price, effectiveDiscount);
              const total = (discountedPrice * quantities[index]).toFixed(2);
              effectiveGlobalDiscount = effectiveDiscount;
              console.log('GLOBAL EFFECTIVE DISCOUNT : ' + effectiveGlobalDiscount);


              return (
                <div className='product-summary' key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #ddd'
                }}>
                  <div>
                    <h4>{product.product_name}</h4>
                    <p style={{
                      textDecoration: effectiveDiscount > 0 ? 'line-through' : 'none',
                      color: effectiveDiscount > 0 ? '#888' : 'black'
                    }}>
                      Original Price: ₱{product.price.toFixed(2)}
                    </p>
                    {effectiveDiscount > 0 && (
                      <p style={{ color: 'green', fontWeight: 'bold' }}>
                        Discounted Price: ₱{discountedPrice.toFixed(2)} at {effectiveDiscount}% Off
                      </p>
                    )}
                    <input
                      type='number'
                      min='1'
                      value={quantities[index]}
                      onChange={e => handleQuantityChange(index, e)}
                      style={{ width: '50px', marginRight: '10px' }}
                    />
                    <button onClick={() => handleRemoveProduct(index)}>Remove</button>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>₱{total}</div>
                </div>
              );
            })}

            <span>Shipping Fee: ₱150</span>
            <div className='total-price' style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
              fontSize: '1.2em',
              fontWeight: 'bold'
            }}>
              <span>Total Price:</span>
              <span>₱{calculateTotalPrice().toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
