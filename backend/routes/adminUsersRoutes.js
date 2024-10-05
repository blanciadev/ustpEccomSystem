const express = require('express');
const router = express.Router();
const db = require('../db');

// Route to get users reports 
router.get('/admin-users-report', async (req, res) => {
    try {
        const query = `SELECT * FROM users`; // Adjust based on your table structure
        const [results] = await db.execute(query);

        res.json({
            data: results
        });
    } catch (error) {
        console.error('Error retrieving users:', error.message);
        res.status(500).json({ error: 'Failed to retrieve users. Please try again.' });
    }
});

// Route to get users counts
router.get('/admin-users-count', async (req, res) => {
    try {
        const query = `SELECT * FROM users`; // Adjust based on your table structure
        const [results] = await db.execute(query);

        // Calculate user counts
        const newUsersCount = results.filter(user => user.role_type === 'user').length;
        const totalEmployeesCount = results.filter(user => user.role_type === 'Admin').length;
        const activeCustomersCount = results.filter(user => user.status === 'active').length; // Assuming you have a status field
        const inactiveCustomersCount = results.filter(user => user.status === 'inactive').length; // Assuming you have a status field

        res.json({
            data: {
                newUsers: newUsersCount,
                totalEmployees: totalEmployeesCount,
                activeCustomers: activeCustomersCount,
                inactiveCustomers: inactiveCustomersCount,
            }
        });
    } catch (error) {
        console.error('Error retrieving users:', error.message);
        res.status(500).json({ error: 'Failed to retrieve users. Please try again.' });
    }
});




module.exports = router;
