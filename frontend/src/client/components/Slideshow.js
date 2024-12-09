import React,{ useState, useEffect } from 'react'
import { Fade } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css'
import banner1 from '../../assets/img/banner1.png'
import banner2 from '../../assets/img/banner2.png'
import banner3 from '../../assets/img/banner3.png'


const Slideshow = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
  
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    return (
      <div className="mt-2" style={{ height: "420px", width: "100%" }}>
      <div className="container-fluid h-100">
        <div className="row h-100 gx-2">
          

          <div className={`col-md-${isMobile ? 12 : 9} h-100 p-0 pe-2`}>
            <div id="carouselExampleInterval" className="carousel slide h-100" data-bs-ride="carousel">
              <div className="carousel-inner h-100">
                <div className="carousel-item active" data-bs-interval="3000">
                  <img src={banner3} className="d-block w-100 h-100" alt="Banner 3" />
                </div>
                <div className="carousel-item" data-bs-interval="3000">
                  <img src={banner2} className="d-block w-100 h-100" alt="Banner 2" />
                </div>
                <div className="carousel-item">
                  <img src={banner1} className="d-block w-100 h-100" alt="Banner 1" />
                </div>
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>
          

          <div className="col-md-3 h-100 p-0" style={{ display: isMobile ? 'none' : 'block' }}>
            <div className="row h-50 m-0">
              <div className="col-12 p-0">
                <img src={banner1} className="d-block w-100 h-100 " alt="Banner 1" />
              </div>
            </div>
            <div className="row h-50 m-0">
              <div className="col-12 p-0">
                <img src={banner2} className="d-block w-100 h-100 " alt="Banner 2" />
              </div>
            </div>
          </div>
    
        </div>
      </div>
    </div>
    
    )
  }

export default Slideshow