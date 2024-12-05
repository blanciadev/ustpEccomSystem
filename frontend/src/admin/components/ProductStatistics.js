import React from 'react';

const ProductStatistics = ({
    bestSellingCount,
    totalQuantity,
    lowStockCount,
    unpopularProducts,
    outOfStockCount,
    discontinuedCount
}) => {
    return (
        <div className='product-qty'>
            
            <div className='best-selling'>
                <div className='qty'>
                    <i className='bx bxs-spa'></i>
                    <h6>{bestSellingCount}</h6>
                </div>
                <div>
                    <h6>Best Selling</h6>
                </div>
            </div>

            <div className='in-stock'>
                <div className='qty'>
                    <i className='bx bxs-spa'></i>
                    <h6>{totalQuantity}</h6>
                </div>
                <div>
                    <h6>Total Stocks</h6>
                </div>
            </div>

            <div className='low-stock'>
                <div className='qty'>
                    <i className='bx bxs-spa'></i>
                    <h6>{lowStockCount}</h6>
                </div>
                <div>
                    <h6>Low Stock</h6>
                </div>
            </div>

            <div className='unpopular'>
                <div className='qty'>
                    <i className='bx bxs-spa'></i>
                    <h6>{unpopularProducts.length}</h6>
                </div>
                <div>
                    <h6>Unpopular</h6>

                </div>
            </div>

            <div className='out-of-stock'>
                <div className='qty'>
                    <i className='bx bxs-spa text-dark'></i>
                    <h6 className="text-dark">{outOfStockCount}</h6>
                </div>
                <div>
                    <h6 className="text-dark">Out of Stock</h6>
                </div>
            </div>

            <div className='discontinued'>
                <div className='qty'>
                    <i className='bx bxs-spa'></i>
                    <h6>{discontinuedCount}</h6>
                </div>
                <div>
                    <h6>Discontinued</h6>
                </div>
            </div>
        </div>
    );
};

export default ProductStatistics;
