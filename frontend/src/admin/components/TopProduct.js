import React, { useEffect, useState } from 'react';
import '../admin.css';

const TopProduct = () => {
  const [data, setData] = useState([]);

  // Fetch top products data from the backend
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch('http://localhost:5001/top-products');
        const result = await response.json();
        setData(result.products);
      } catch (error) {
        console.error('Error fetching top products:', error);
      }
    };

    fetchTopProducts();
  }, []);

  // Sort data by cart_quantity (descending)
  const sortedData = [...data].sort((a, b) => b.cart_quantity - a.cart_quantity);

  return (
    <div className="top-product">
      <div className="cheader">
        <div className="top-product__title">
          <h5>Top Products</h5>
        </div>
      </div>

      <div className="table-responsive top-product__table-wrapper">
        <table className="table top-product__table">
            <thead className="bg-light sticky-top">
            <tr className="top-product__table-header">
                <th>#</th>
                <th>Product</th>
                <th>Progress</th>
                <th>Available</th>
            </tr>
            </thead>
            <tbody>
            {sortedData.map((item, index) => (
                <tr key={item.id} className="top-product__table-row">
                <td><strong>{index + 1}</strong></td>
                <td>{item.product}</td>
                <td>
                    <div className="top-product__progress-bar-container">
                    <div
                        className="top-product__progress-bar"
                        style={{
                        width: `${(item.cart_quantity / item.available_quantity) * 100}%`,
                        }}
                    />
                    </div>
                </td>
                <td>{item.available_quantity}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>

    </div>
  );
};

export default TopProduct;
