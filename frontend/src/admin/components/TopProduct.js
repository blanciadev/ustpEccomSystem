import React from 'react';
import '../admin.css';

const data = [
  { id: 1, product: 'Product A', popularity: 90, sales: 70 },
  { id: 2, product: 'Product B', popularity: 75, sales: 65 },
  { id: 3, product: 'Product C', popularity: 90, sales: 80 },
  { id: 4, product: 'Product D', popularity: 60, sales: 55 },
  { id: 5, product: 'Product E', popularity: 70, sales: 60 },
];

// Sort data by popularity and sales (descending)
const sortedData = [...data].sort((a, b) => {
  // First sort by popularity, then by sales if popularity is the same
  if (b.popularity === a.popularity) {
    return b.sales - a.sales;
  }
  return b.popularity - a.popularity;
});

const TopProduct = () => {
  return (
    <div className='top-products'>
        <div className='header'>
            <div className='title'>
                <h5>Top Products</h5>
            </div> 
        </div>
        <div className='product-table'>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Popularity</th>
                <th>Sales</th>
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
                        style={{ width: `${item.popularity}%` }}
                      />
                      {item.popularity}%
                    </div>
                  </td>
                  <td>{item.sales}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default TopProduct;
