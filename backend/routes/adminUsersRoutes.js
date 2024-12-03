const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');



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

        if (!customer_id) {
            return res.status(400).json({ error: 'Customer ID is required.' });
        }

        const query = `SELECT * FROM users WHERE customer_id = ?`;
        const [results] = await db.execute(query, [customer_id]);

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

router.put('/admin-users-role-update', async (req, res) => {
    const { customer_id, role_type, date_hired, address } = req.body;

    if (!customer_id || !role_type) {
        return res.status(400).json({ message: 'Customer ID and role type are required.' });
    }

    try {

        const query = `
            UPDATE users
            SET role_type = ?, date_hired = ?, address = ?
            WHERE customer_id = ?
        `;

        const result = await db.query(query, [role_type, date_hired || null, address || null, customer_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or no changes made.' });
        }

        console.log('Update Result:', result);
        return res.status(200).json({ message: 'User details updated successfully.' });
    } catch (error) {
        console.error('Error updating user details:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});


router.put('/admin-users-password-update', async (req, res) => {
    const { customer_id, current_password, new_password } = req.body;

    if (!customer_id || !current_password || !new_password) {
        console.log('Missing fields in the request body:', req.body);
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        console.log(`Request to update password for customer_id: ${customer_id}`);

        const userQuery = 'SELECT * FROM users WHERE customer_id = ?';
        console.log('Executing query to fetch user with customer_id:', customer_id);
        const userResult = await db.query(userQuery, [customer_id]);

        console.log('Query result:', userResult);

        if (userResult.length === 0) {
            console.log(`User not found with customer_id: ${customer_id}`);
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = userResult[0][0];
        console.log(`User found: ${user.customer_id}`);

        // Compare current password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(current_password, user.password);

        if (!passwordMatch) {
            console.log(`Incorrect current password for customer_id: ${customer_id}`);
            return res.status(403).json({ message: 'Incorrect current password.' });
        }

        console.log(`Password match for customer_id: ${customer_id}. Proceeding with password update.`);

        if (current_password === new_password) {
            console.log(`New password is the same as the old password for customer_id: ${customer_id}`);
            return res.status(400).json({ message: 'New password cannot be the same as the current password.' });
        } else {
            // Hash the new password before saving it
            const hashedNewPassword = await bcrypt.hash(new_password, 10);  // Salt rounds can be adjusted (e.g., 10)

            const updatePasswordQuery = 'UPDATE users SET password = ? WHERE customer_id = ?';
            console.log('Executing query:', updatePasswordQuery, [hashedNewPassword, customer_id]);

            // Update the password in the database with the hashed new password
            const result = await db.query(updatePasswordQuery, [hashedNewPassword, customer_id]);
            return res.status(200).json({ message: 'Password updated successfully.' });
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

        // Count based on role_type
        const customersCount = results.filter(user => user.role_type === 'Customer').length;
        const adminsCount = results.filter(user => user.role_type === 'Admin').length;
        const warehouseManagersCount = results.filter(user => user.role_type === 'Warehouse Manager').length;

        res.json({
            data: {
                customers: customersCount, // Count of customers
                admins: adminsCount,       // Count of admins
                warehouseManagers: warehouseManagersCount, // Count of warehouse managers
            }
        });
    } catch (error) {
        console.error('Error retrieving users:', error.message);
        res.status(500).json({ error: 'Failed to retrieve users. Please try again.' });
    }
});


module.exports = router;
