import React from 'react'
import axios from 'axios';
import ProductList from './ProductList';

const Products = () => {
  return (
    <div className='products-con'>
      <h2>SHOP</h2>
      <div className='products'>
        <ProductList />

      </div>
    </div>

  )
}

export default Products