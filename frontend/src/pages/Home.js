import React from 'react'
import Navigation from '../components/Navigation';
import Slideshow from '../components/Slideshow';
import Products from '../components/Products';
import Footer from '../components/Footer';

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