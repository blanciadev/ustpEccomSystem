const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendOrderUpdate } = require('./adminOrderHistory'); // Import the sendOrderUpdate function

module.exports = router;
