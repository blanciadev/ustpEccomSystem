import React from 'react'

const Productcard = () => {
  return (
    <div className='procard'>
            <div className='productimg' style={{width:'100%',height:'65%', }}>
                <img style={{width:'98%', height:'100%',objectFit:'cover'}} src='https://cdn.shopify.com/s/files/1/1969/5775/files/topics_pic01_sp_480x480.png?v=1707100431' alt='product-image'/>
            </div>
            <div className='productdesc' style={{width:'100%', height:'35%',}}>
                <div className='product-data'>
                    <p>Hair Care 250ml</p>
                    <h3>Brand</h3>
                    <p>Place</p>
                    <p className='price'>$Price</p>
                </div>
                <div className='order-options'>
                    <button>Add to Cart</button>
                    <button>Buy Now</button>
                </div>
                
            </div>
        </div>
  )
}

export default Productcard