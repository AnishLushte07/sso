const express = require('express');
const controller = require('./passwordResetLogin.controller');

const router = express.Router();

router.post('/', controller.create);

module.exports = router;
