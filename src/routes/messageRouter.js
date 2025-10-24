// src/routes/messageRouter.js

const express = require("express");
const messageController = require('../controllers/messageController'); // Adjust path if needed
// const authController = require('../controllers/authController'); // No longer needed for this route

const router = express.Router();

// This endpoint is for testing with Postman.
router.post(
    "/postman-test", 
    // authController.protect, // Removed this line
    messageController.sendMessageFromPostman // This is now the only handler
);

module.exports = router;