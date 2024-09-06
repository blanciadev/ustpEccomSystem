import React from 'react'
import './Signup.css'

const Signup = () => {
  return (
    <div className='signup-con'>
        <div className='signup-box'>
            <div className='signup-form'>
                <form>
                    <div className='input'>
                        <label>Email</label>
                        <input/>
                    </div>
                    <div className='input'>
                        <label>Password</label>
                        <input/>
                    </div>
                    <div className='input'>
                        <label>Confirm Password</label>
                        <input/>
                    </div>

                    <button type='submit'>Sign Up</button>
                </form>
            </div>
            <div></div>
        </div>
    </div>
  )
}

export default Signup