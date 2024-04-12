const express = require('express');
const router = express.Router();

const loginController = require('../controllers/loginController')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/catalog')
});
router.get('/login', loginController.loginGET)
router.post('/login', loginController.loginPOST)

module.exports = router;
