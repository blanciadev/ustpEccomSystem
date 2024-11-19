import React from 'react'
import './Home.css';
import Navigation from '../../client/components/Navigation';
import Slideshow from '../../client/components/Slideshow';
import Products from '../../client/components/Products';
import Footer from '../../client/components/Footer';

const Home = () => {

  return (
    <div className='home-con'>
      <Navigation />
      <Slideshow />
      <Products />
      <Footer />
    </div>
  )
}

export default Home