import React from 'react'
import './Login.css'

const Login = () => {
  return (
    <div className='login-con'>
        <div className='login-box'>
            <div className='login-form'>
                <h1>Log In</h1>
                <form>
                    <div className='input'>
                        <label>Email</label>
                        <input type='text'/>
                    </div>
                    <div className='input'>
                        <label>Password</label>
                        <input type='password'/>
                    </div>
                    <button type='submit'>Log In</button>
                </form>

                <p>Dont have an account?<a href='/signup'>Sign Up</a></p>
            </div>
            <div className='login-image'>
                <img src='https://www.vistaresidences.com.ph/assets/img/condo-hair-care-routine.png' alt='girl taking care of her hair'/>
            </div>
        </div>
    </div>
  )
}

export default Login