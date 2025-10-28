const express = require("express");
const messageController = require('../controllers/messageController');

const router = express.Router();

// This endpoint is for testing with Postman.
router.post(
    "/postman-test", 
    messageController.sendMessageFromPostman 
);

module.exports = router;