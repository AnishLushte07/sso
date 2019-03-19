const express = require('express');
const controller = require('./passwordResetLogin.controller');

const router = express.Router();

router.get('/:id', controller.getUser);
router.post('/', controller.create);
router.put('/:id', controller.resetPassword);

module.exports = router;
