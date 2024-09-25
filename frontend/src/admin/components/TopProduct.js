import React, { useEffect, useState } from 'react';

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

  // Sort data by interaction_count (descending)
  const sortedData = [...data].sort((a, b) => b.cart_quantity - a.cart_quantity); // Sorting by cart_quantity

  // CSS styles
  const styles = {
    topProducts: {
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    header: {
      marginBottom: '15px',
    },
    productTable: {
      width: '120%',
      borderCollapse: 'collapse',
    },
    tableHeader: {
      backgroundColor: '#007bff',
      color: '#fff',
    },
    tableRow: {
      borderBottom: '1px solid #ddd',
    },
    progressBarContainer: {
      position: 'relative',
      height: '20px',
      backgroundColor: '#e0e0e0',
      borderRadius: '5px',
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#76c7c0',
      borderRadius: '5px',
      transition: 'width 0.3s ease',
    },
    progressPercentage: {
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.topProducts}>
      <div style={styles.header}>
        <div style={styles.title}>
          <h5>Top Products</h5>
        </div>
      </div>

      <div className="product-table">
        <table style={styles.productTable}>
          <thead>
            <tr style={styles.tableHeader}>
              <th>#</th>
              <th>Product</th>
              <th>Progress</th>
              <th>Available Quantity</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={item.id} style={styles.tableRow}>
                <td>{index + 1}</td>
                <td>{item.product}</td>
                <td>
                  <div style={styles.progressBarContainer}>
                    <div
                      style={{
                        ...styles.progressBar,
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
