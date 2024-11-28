const express = require('express');
const router = express.Router();
const db = require('../db');

// Route to get users reports 
router.get('/admin-users-report', async (req, res) => {
    try {
        const query = `SELECT * FROM users`;
        const [results] = await db.execute(query);

        res.json({
            data: results
        });
    } catch (error) {
        console.error('Error retrieving users:', error.message);
        res.status(500).json({ error: 'Failed to retrieve users. Please try again.' });
    }
});

router.get('/admin-users-details', async (req, res) => {
    try {
        const { customer_id } = req.query;

        // Validate the customer_id
        if (!customer_id) {
            return res.status(400).json({ error: 'Customer ID is required.' });
        }

        // Use a parameterized query to prevent SQL injection
        const query = `SELECT * FROM users WHERE customer_id = ?`;
        const [results] = await db.execute(query, [customer_id]);

        // Check if results exist
        if (results.length === 0) {
            return res.status(404).json({ error: 'No user found with the provided customer ID.' });
        }

        res.json({
            data: results
        });
    } catch (error) {
        console.error('Error retrieving users:', error.message);
        res.status(500).json({ error: 'Failed to retrieve users. Please try again.' });
    }
});


router.put('/admin-users-details-update', async (req, res) => {
    const { customer_id, first_name, email, phone_number } = req.body;

    if (!customer_id || !first_name || !email || !phone_number) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Log the values for debugging
        console.log(`Updating user with ID: ${customer_id}`);
        console.log(`First Name: ${first_name}, Email: ${email}, Phone Number: ${phone_number}`);

        const query = `
            UPDATE users
            SET first_name = ?, email = ?, phone_number = ?
            WHERE customer_id = ?
        `;
        const result = await db.query(query, [first_name, email, phone_number, customer_id]);
        console.log(result)

        return res.status(200).json({ message: 'Personal information updated successfully.' });

    } catch (error) {
        console.error('Error updating personal information:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});




router.put('/admin-users-password-update', async (req, res) => {
    const { customer_id, current_password, new_password } = req.body;

    // Ensure required fields are provided
    if (!customer_id || !current_password || !new_password) {
        console.log('Missing fields in the request body:', req.body); // Log missing fields
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        console.log(`Request to update password for customer_id: ${customer_id}`); // Log customer ID

        // Fetch the user's current password
        const userQuery = 'SELECT * FROM users WHERE customer_id = ?';
        console.log('Executing query to fetch user with customer_id:', customer_id); // Log query execution
        const userResult = await db.query(userQuery, [customer_id]);

        console.log('Query result:', userResult); // Log the query result

        if (userResult.length === 0) {
            console.log(`User not found with customer_id: ${customer_id}`); // Log when user is not found
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = userResult[0][0]; // Fix: Access the first element of the first array
        console.log(`User found: ${user.customer_id}`); // Log user details

        // Check if the provided current password matches the stored password
        if (user.password !== current_password) {
            console.log(`Incorrect current password for customer_id: ${customer_id}`); // Log incorrect password attempt
            return res.status(403).json({ message: 'Incorrect current password.' });
        }

        // Log password change request
        console.log(`Password match for customer_id: ${customer_id}. Proceeding with password update.`);

        // Check if the new password is the same as the old one
        if (user.password === new_password) {
            console.log(`New password is the same as the old password for customer_id: ${customer_id}`);
            return res.status(400).json({ message: 'New password cannot be the same as the current password.' });
        } else {

            // Update the password in the database
            const updatePasswordQuery = 'UPDATE users SET password = ? WHERE customer_id = ? ';
            console.log('Executing query:', updatePasswordQuery, [new_password, customer_id]);
            const result = await db.query(updatePasswordQuery, [new_password, customer_id]);
            return res.status(200).json({ message: 'Password updated successfully.' });
            // if (result.affectedRows > 0) {
            //     console.log(`Password successfully updated for customer_id: ${customer_id}`);
            //     return res.status(200).json({ message: 'Password updated successfully.' });
            // } else {
            //     console.log(`Failed to update password for customer_id: ${customer_id}. No rows affected.`);
            //     return res.status(500).json({ message: 'Failed to update password.' });
            // }
        }
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});









// Route to get users counts
router.get('/admin-users-count', async (req, res) => {
    try {
        const query = `SELECT * FROM users`;
        const [results] = await db.execute(query);

        // Calculate user counts
        const newUsersCount = results.filter(user => user.role_type === 'user').length;
        const totalEmployeesCount = results.filter(user => user.role_type === 'Admin').length;
        const activeCustomersCount = results.filter(user => user.status === 'active').length;
        const inactiveCustomersCount = results.filter(user => user.status === 'inactive').length;

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
