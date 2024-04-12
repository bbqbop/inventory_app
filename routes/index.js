const express = require('express');
const router = express.Router();

const sessionController = require('../controllers/sessionController')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/catalog')
});
router.get('/login', sessionController.loginGET)
router.post('/login', sessionController.loginPOST)

router.post('/logout', sessionController.logoutPOST)

module.exports = router;
