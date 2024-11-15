import React from 'react'
import { Fade } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css'
import slideshow1 from '../../assets/slideshow-1.png'
import slideshow2 from '../../assets/slideshow-2.png'
import slideshow3 from '../../assets/slideshow-3.png'

const fadeImages  = [
    {
      imgURL:
        {slideshow1},
      imgAlt: "img-1"
    },
    {
      imgURL:
        {slideshow2},
      imgAlt: "img-2"
    },
    {
      imgURL:
        {slideshow3},
      imgAlt: "img-3"
    },
]
const Slideshow = () => {
    return (
      <div className="slideshow-con">
        <Fade>
          {fadeImages.map((fadeImage, index) => (
            <div key={index}>
              <img src={fadeImage.imgURL} alt={fadeImage.imgAlt}/>
            </div>
          ))}
        </Fade>
      </div>
    )
  }

export default Slideshow