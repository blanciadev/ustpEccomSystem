import React from 'react'
import Productcard from './Productcard'

const Products = () => {
  return (
    <div className='products-con'>
        <h2>Our Products</h2>
        <div className='products'>
            
            <Productcard/>
            <Productcard/>
            <Productcard/> 
            <Productcard/>
                       {/* to do: product.map to display data from data base */}
        </div>
    </div>
    
  )
}

export default Products