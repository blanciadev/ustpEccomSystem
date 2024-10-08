import React from 'react'

const modal = () => {
  return (
    <div class="container">
   <div class="product">
    <div class="product-image">
     <img alt="L'Oréal Professionnel Serie Expert Scalp Advanced Anti-Dandruff Shampoo 300ML" height="500" src="https://placehold.co/300x500" width="300"/>
     <div class="price-stock">
      <p>
       <strong>
        Price
       </strong>
      </p>
      <p>
       ₱942.00
      </p>
      <p>
       <strong>
        Stocks
       </strong>
      </p>
      <p>
       120
      </p>
     </div>
    </div>
    <div class="product-details">
     <p>HAIRCARE • Shampoo</p>
     <h1>{product.product_name}</h1>
     <p><strong>Description:</strong>
     {product.description || 'No description available.'}
     </p>
     <p><strong>Hair Type:</strong>
      Suitable for virgin and colored hair.{/**/}
     </p>
     <p><strong>Hair Texture:</strong>
      Works for straight, wavy, or curly hair.
     </p>
     <p><strong>Effect/Target Problems:</strong>
      Treats dandruff, reduces scalp irritation, and soothes sensitive scalps.
     </p>
     <div class="quantity">
      <p><strong>Quantity</strong></p>
      <button>-</button>
      <input type="text" value="1"/>
      <button>+</button>
     </div>
     <div class="buttons">
        {product.quantity > 0 ? (
            <>
                <button onClick={() => onAddToCart(product)}><i class="bx bx-cart"></i>Add to Cart</button>
                <button onClick={() => handleBuyNow(product)}
                                style={{ marginLeft: '10px' }}
                            >Buy Now</button>
            </>
        ) : (
            <p style={{ color: 'red' }}>Out of stock</p>
        )}
     </div>
    </div>


   </div>
   <div class="recommended-products">
    <h2>
     Recommended Products
    </h2>
    <p>
     Save money, avail discounted items
    </p>
    <div class="recommended-items">
     <div class="recommended-item">
      <div class="discount">
       5% Discount
      </div>
      <img alt="L'Oréal Professionnel Serie Expert Scalp Advanced Anti-Dandruff Shampoo 300ML" height="200" src="https://placehold.co/100x200" width="100"/>
      <p>
       L'Oréal Professionnel Serie Expert Scalp Advanced Anti-Dandruff Shampoo 300ML
      </p>
      <p>
       <strong>
        ₱894.90
       </strong>
       <span style="text-decoration: line-through;">
        ₱942.00
       </span>
      </p>
     </div>
     <div class="recommended-item">
      <div class="discount">
       5% Discount
      </div>
      <img alt="L'Oréal Professionnel Serie Expert Scalp Advanced Anti-Discomfort Intense Soother Treatment 200ML" height="200" src="https://placehold.co/100x200" width="100"/>
      <p>
       L'Oréal Professionnel Serie Expert Scalp Advanced Anti-Discomfort Intense Soother Treatment 200ML
      </p>
      <p>
       <strong>
        ₱894.90
       </strong>
       <span style="text-decoration: line-through;">
        ₱942.00
       </span>
      </p>
     </div>
     <div class="recommended-item">
      <div class="discount">
       5% Discount
      </div>
      <img alt="L'Oréal Professionnel Serie Expert Scalp Advanced Anti-Dandruff Shampoo 300ML" height="200" src="https://placehold.co/100x200" width="100"/>
      <p>
       L'Oréal Professionnel Serie Expert Scalp Advanced Anti-Dandruff Shampoo 300ML
      </p>
      <p>
       <strong>
        ₱894.90
       </strong>
       <span style="text-decoration: line-through;">
        ₱942.00
       </span>
      </p>
     </div>
    </div>
    <div class="total-price">
     <p>
      Total Price:
      <strong>
       ₱1,698.60
      </strong>
      <span style="text-decoration: line-through;">
       ₱1,788.00
      </span>
     </p>
    </div>
    <div class="add-selected">
     <button>
      <i class="bx bx-cart">
      </i>
      Add Selected Items to Cart
     </button>
    </div>
   </div>
  </div>
  )
}

export default modal