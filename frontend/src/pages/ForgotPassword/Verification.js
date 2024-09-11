import React from 'react'
import './Forgot.css'

const Verification = () => {
  return (
    <div>
        <div className='ver-con'>
        <div className='ver-box'>
          
          <div className='ver-form'>
            <h1>Forgot Password</h1>
            <hr/>

            <div className='text-con'>
                <p>We've sent a verification code to your email</p>
              </div>
            <form>
              <input type='text' maxLength={1}/>
              <input type='text' maxLength={1}/>
              <input type='text' maxLength={1}/>
              <input type='text' maxLength={1}/>
              <input type='text' maxLength={1}/>
              <input type='text' maxLength={1}/>
            </form>
            <button>Continue</button>

          </div>
        </div>
    </div>
    </div>
  )
}

export default Verification