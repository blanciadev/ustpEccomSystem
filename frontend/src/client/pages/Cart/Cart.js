import React, { useEffect, useState } from 'react';
import './Cart.css';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import CartProduct from '../../components/CartProduct';
import cartEventEmitter from '../../components/cartEventEmitter';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../../../public/components/ToastNotification';

const CartContent = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        if (isLoggedIn) {
          const response = await fetch('http://localhost:5001/cart', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });

          const data = await response.json();

          if (response.ok) {
            setCartItems(data.items);
          } else {
            setError(data.message || 'Failed to fetch cart items');
          }
        } else {
          const localCart = JSON.parse(localStorage.getItem('cart')) || [];
          setCartItems(localCart);
        }
      } catch (err) {
        setError('Error fetching cart items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [isLoggedIn]);

  const computeTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems[item.product_code]) {
        return total + item.sub_total;
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    setTotalPrice(computeTotalPrice());
  }, [selectedItems, cartItems]);

  const toggleItemSelection = (productCode) => {
    setSelectedItems(prevSelected => ({
      ...prevSelected,
      [productCode]: !prevSelected[productCode],
    }));
  };

  const handleSelectAll = (selectAll) => {
    const newSelection = {};
    cartItems.forEach(item => {
      newSelection[item.product_code] = selectAll;
    });
    setSelectedItems(newSelection);
  };

  useEffect(() => {
    const handleToggleSelectAll = (selectAll) => {
      handleSelectAll(selectAll);
    };

    cartEventEmitter.on('toggleSelectAll', handleToggleSelectAll);

    return () => {
      cartEventEmitter.off('toggleSelectAll', handleToggleSelectAll);
    };
  }, [cartItems]);

  const handleCheckout = () => {
    const token = localStorage.getItem('token');

    const selectedProducts = cartItems.filter(item => selectedItems[item.product_code]);

    if (selectedProducts.length === 0) {
      alert("Please select at least one product to proceed to checkout.");
      return;
    }
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));

    if (!token) {
      // Set the redirect to checkout after login
      localStorage.setItem('redirectTo', '/checkout');

      navigate('/login');
    } else {
      navigate('/checkout', { state: { selectedProducts, totalPrice } });
    }

  };


  const updateCartQuantity = async (cartItemId, newQuantity) => {
    try {
      console.log(`Attempting to update quantity for cart item ID: ${cartItemId} to new quantity: ${newQuantity}`);

      if (isLoggedIn) {
        const response = await fetch(`http://localhost:5001/cart-update-quantity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            cart_items_id: cartItemId,
            newQuantity: newQuantity,
          }),
        });

        console.log(`Server response status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error from server:', errorData);
          throw new Error('Failed to update quantity');
        }

        console.log('Quantity updated successfully on the server');
      } else {
        const updatedItems = cartItems.map((item) => {
          console.log(`Checking item: `, item);

          if (item.cart_items_id === cartItemId) {
            const updatedItem = {
              ...item,
              quantity: newQuantity,
              sub_total: item.price * newQuantity
            };
            console.log(`Updated item: `, updatedItem);
            return updatedItem;
          }
          return item;
        });

        setCartItems(updatedItems);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        console.log('Local storage updated with new cart items:', updatedItems);
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Error updating quantity. Please try again later.');
    }
  };



  const removeFromCart = async (cartItemId) => {
    try {
      if (isLoggedIn) {
        const response = await fetch(`http://localhost:5001/cart-delete/${cartItemId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setToastMessage('Deleted!');

        setTimeout(() => {
          setToastMessage('');
        }, 3000);


        if (!response.ok) {
          throw new Error('Failed to remove item from cart');
        }
      }

      setCartItems(cartItems.filter(item => item.cart_items_id !== cartItemId));
      const updatedCart = cartItems.filter(item => item.cart_items_id !== cartItemId);
      setCartItems(updatedCart);

      if (!isLoggedIn) {
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
    } catch (err) {
      setError('Error removing item. Please try again later.');
    }
  };

  return (
    <div className='cart'>
      <Navigation />
      <ToastNotification toastMessage={toastMessage} />
      <div className='cart__box'>
        <h1 className='cart__title'><i style={{ fontSize: '1.7rem', paddingLeft: '5px' }} class='bx bxs-cart-alt' ></i>Shopping Cart</h1>
        {loading ? (
          <p>Loading cart items...</p>
        ) : error ? (
          <p className="cart__error-message">{error}</p>
        ) : cartItems.length === 0 ? (
          <p className="cart__empty-message">Your cart is empty!</p>
        ) : (
          <div className='cart__table'>
            <table className='cart__table-inner'>
              <thead>
                <tr className='cart__table-header'>
                  <th></th>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Sub-total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <CartProduct
                    key={item.product_code}
                    productName={item.product_name}
                    quantity={item.quantity}
                    price={item.price}
                    subTotal={item.sub_total}
                    productCode={item.product_code}
                    cartItemId={item.cart_items_id}
                    isSelected={!!selectedItems[item.product_code]}
                    toggleItemSelection={toggleItemSelection}
                    updateQuantity={updateCartQuantity}
                    removeFromCart={removeFromCart}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4">Total</td>
                  <td>₱{totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>"///;"
              </tfoot>
            </table>
            <div className='cart__checkout'>
              <button className='cart__checkout-button' onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartContent;
