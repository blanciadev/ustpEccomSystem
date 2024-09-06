import React from 'react'

const Navigation = () => {
    const links = [
        {
            id : 1,
            page : "Shop",
            link : "/"
        },
        {
            id : 2,
            page : "About Us",
            link : "/"
        },
        {
            id : 3,
            page : "Cart",
            link : "/"
        },
        {
            id : 4,
            page : "Sign Up",
            link : "signup"
        },
        {
            id : 5,
            page : "Login",
            link : '/login'
        },
        
    ]
  return (
    <div className='nav-container'>
        <div className='logo'>
            <a href='/'>
            {/* Change logo */}
                <img src='https://us.123rf.com/450wm/dmrgraphic/dmrgraphic2105/dmrgraphic210500421/169019761-hair-woman-and-face-logo-and-symbols.jpg?ver=6' alt='Logo'/>
                <h1>N&B Beauty Vault</h1>
            </a>
        </div>

        <div className='searchbar'>
            <form>
                <input type='search' placeholder='Search Product'/>
                <button type='submit'><i class='bx bx-search' style={{color:'#ffffff'}}  ></i></button>
            </form>
        </div>

        <div className='navlinks'>
            <ul>
                {
                links.map((data) => (
                    <li key={data.id}> <a href={data.link}>{data.page}</a></li>
                ))
            }
            </ul>
            {/* <ul>
                <li><a href='/'>Shop</a></li>
                <li><a href='/'>About Us</a></li>
                <li><a href='/'><i class='bx bxs-cart' style={{color:'#f05f77' }}></i>Cart</a></li>
                <li className='partition'>|</li>
                <li><a href='/'>Sign Up</a></li>
                <li><a href={<Login/>} className='login-btn'>Login</a></li>
            </ul> */}

        </div>
        

    </div>
  );
}

export default Navigation