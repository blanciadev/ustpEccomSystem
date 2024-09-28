import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import './StickyComponent.css'; 


const StickyComponent = () => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  return (
    <>
      {/* Sticky Button */}
      <div className={`sticky-card ${isClicked ? 'clicked' : ''}`} onClick={handleClick}>
        <p>Find Your Perfect Haircare Match</p>
        <i class='bx bx-chevron-right' style={{fontSize: '26pt'}}></i>
      </div>

      {/* Expanded Content */}
      <div className={`expanded-content ${isClicked ? 'show' : ''}`}>
        <Card>
          <Card.Body>
            <h5>Healthy Hair Starts Here!</h5>
            <div className='forms'>

            <form>
                <p>Hair Type:</p>
                <div className='input'>
                  <input type='radio' id='straight' value='straight' name='hair-type'/>
                  <label for='straight'>Straight</label>
                </div>
                <div className='input'>
                  <input type='radio' id='wavy' value='wavy' name='hair-type'/>
                  <label for='wavy' >Wavy</label>
                </div>
                <div className='input'>
                  <input type='radio' id='curly' value='curly' name='hair-type'/>
                  <label for='curly' >Curly</label>
                </div>
                
            </form>

            <form>
                <p>Length:</p>
                <div className='input'>
                  <input type='radio' id='long' value='long' name='hair-length'/>
                  <label for='long'>Long</label>
                </div>
                <div className='input'>
                  <input type='radio' id='medium' value='medium' name='hair-length'/>
                  <label for='medium'>Medium</label>
                </div>
                <div className='input'>
                  <input type='radio' id='short' value='short' name='hair-length'/>
                  <label for='short' >Short</label>
                </div>
                
            </form>

            <form>
                <p>Status:</p>
                <div className='input'>
                  <input type='radio' id='frizzy' value='frizzy' name='hair-status'/>
                  <label for='frizzy'>frizzy</label>
                </div>
                <div className='input'>
                  <input type='radio' id='damaged' value='damaged' name='hair-status'/>
                  <label for='damaged' >damaged</label>
                </div>
                <div className='input'>
                  <input type='radio' id='oily' value='oily' name='hair-status'/>
                  <label for='oily' >oily</label>
                </div>
                <div className='input'>
                  <input type='radio' id='dry' value='dry' name='hair-status'/>
                  <label for='dry' >dry</label>
                </div>
                <div className='input'>
                  <input type='radio' id='normal' value='normal' name='hair-status'/>
                  <label for='normal' >normal</label>
                </div>
                
            </form>
            <div className='two-forms'>
            <form>
                <p>Density:</p>
                <div className='input'>
                  <input type='radio' id='thin' value='thin' name='hair-density'/>
                  <label for='thin'>thin</label>
                </div>
                <div className='input'>
                  <input type='radio' id='medium' value='medium' name='hair-density'/>
                  <label for='medium' >medium</label>
                </div>
                <div className='input'>
                  <input type='radio' id='curly' value='curly' name='hair-density'/>
                  <label for='curly' >Curly</label>
                </div>
                
            </form>
            
            <form>
                <p>Virgin:</p>
                <div className='input'>
                  <input type='radio' id='yes' value='yes' name='hair-virgin'/>
                  <label for='yes'>yes</label>
                </div>
                <div className='input'>
                  <input type='radio' id='no' value='no' name='hair-virgin'/>
                  <label for='no' >no</label>
                </div>
                
            </form>

            </div>

            
            <form>
                <p>Color:</p>
                <div className='input'>
                  <input type='radio' id='natural' value='natural' name='hair-color'/>
                  <label for='natural'>natural</label>
                </div>
                <div className='input'>
                  <input type='radio' id='colored' value='colored' name='hair-color'/>
                  <label for='colored' >colored</label>
                </div>
                
            </form>

            <form>
                <p>White Hairs:</p>
                <div className='input'>
                  <input type='radio' id='yes' value='yes' name='hair-white'/>
                  <label for='yes'>yes</label>
                </div>
                <div className='input'>
                  <input type='radio' id='no' value='no' name='hair-white'/>
                  <label for='no' >no</label>
                </div>
                
            </form>
            <button>Search</button>

            </div>
            
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default StickyComponent;
