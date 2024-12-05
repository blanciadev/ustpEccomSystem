import React from 'react'
import './Loader.css'

const AdminSkeleton = () => {
  return (
    <div className='skeleton'>
        <div className='crskeleton-container'>
            <div className='cskeleton-item'></div>
            
            <div className='cskeleton-container'>
                <div className='cskeleton-item'></div>
                <div className='cskeleton-item'></div>

            </div>

        </div>
    </div>
  )
}

export default AdminSkeleton