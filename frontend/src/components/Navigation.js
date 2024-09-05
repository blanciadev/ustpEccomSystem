import React from 'react'

const Navigation = () => {
  return (
    <div className='nav-container'>
        <div className='logo'>
            <a href='/'>
                <img src='https://us.123rf.com/450wm/dmrgraphic/dmrgraphic2105/dmrgraphic210500421/169019761-hair-woman-and-face-logo-and-symbols.jpg?ver=6' alt='Logo'/>
                <h1>N&B Beauty Vault</h1>
            </a>
        </div>

        <div className='searchbar'>
            <form>
                <input type='search' placeholder='Search...'/>
                <button type='submit'>Go</button>
            </form>
        </div>

        <div className='navlinks'>
            <ul>
                <li><a href='/'>Shop</a></li>
                <li><a href='/'>About Us</a></li>
                <li><a href='/'>Cart</a></li>
                <li><a href='/'>Sign Up</a></li>
                <li><a href='/'>Login</a></li>
            </ul>

        </div>
        

    </div>
  );
}

export default Navigation