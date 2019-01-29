const express = require('express');
const controller = require('./user.controller');
const authenticate = require('./../../components/oauth/authenticate');
const cronAuthenticate = require('./../../components/cronAuth');

const router = express.Router();

router.get('/', controller.index);
router.get('/:id/signupStatus', authenticate(), controller.signupStatus);
router.get('/me', authenticate(), controller.me);
router.get('/authorise', controller.authorise);
router.post('/', cronAuthenticate(), controller.create);
router.post('/magiclink', controller.magiclink);
router.post('/invite', authenticate(), controller.invite);
router.post('/:id/productSignup', authenticate(), controller.productSignup);

router.put('/password', authenticate(), controller.password);
router.put('/:id', controller.update);

module.exports = router;
