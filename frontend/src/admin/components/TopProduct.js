import React, { useEffect, useState } from 'react';
import '../admin.css';

const TopProduct = () => {
  const [data, setData] = useState([]);

  // Fetch top products data from the backend
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/top-products');
        const result = await response.json();
        setData(result.products);
      } catch (error) {
        console.error('Error fetching top products:', error);
      }
    };

    fetchTopProducts();
  }, []);

  // Sort data by interaction_count and interaction_orders (descending)
  const sortedData = [...data].sort((a, b) => {
    if (b.interaction_count === a.interaction_count) {
      return b.interaction_orders - a.interaction_orders; // If interaction count is the same, sort by interaction_orders
    }
    return b.interaction_count - a.interaction_count; // Sort by interaction count first
  });

  return (
    <>
      <div className='top-products'>
        <div className='header'>
          <div className='title'>
            <h5>Top Products</h5>
          </div>
        </div>
        <div className='see-all'>
          <button>See all</button>
        </div>
        <div className='product-table'>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Progress</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td> {/* Ranking starts from 1 */}
                  <td>{item.product}</td>
                  <td>
                    <div className='progress-bar'>
                      <div
                        className='progress'
                        style={{ width: `${item.interaction_count}%` }}
                      />
                      {item.interaction_count}% {/* Inventory progress percentage */}
                    </div>
                  </td>
                  <td>{item.available_quantity}</td> {/* Display the interaction_orders */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TopProduct;
