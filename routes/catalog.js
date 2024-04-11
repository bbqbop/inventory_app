var express = require('express');
var router = express.Router();

// Require controller modules.
const dinoController = require('../controllers/dinoController.js');
const categoryController = require('../controllers/categoryController');
const lifePeriodController = require('../controllers/lifePeriodController');


// GET catalog home page
router.get('/', dinoController.index);



// GET LIST VIEWS //
router.get('/dinos', dinoController.list);
router.get('/categories', categoryController.list);
router.get('/lifeperiods', lifePeriodController.list);

// Create new entries //
router.get('/dino/create', dinoController.createGET)
router.post('/dino/create', dinoController.createPOST)
router.get('/category/create', categoryController.createGET)
router.post('/category/create', categoryController.createPOST)
router.get('/lifeperiod/create', lifePeriodController.createGET)
router.post('/lifeperiod/create', lifePeriodController.createPOST)

// GET detailed views //
router.get('/dino/:id', dinoController.detail);
router.get('/category/:id', categoryController.detail)
router.get('/lifeperiod/:id', lifePeriodController.detail)

// Delete entries //
router.get('/dino/:id/delete', dinoController.deleteGET)
router.post('/dino/:id/delete', dinoController.deletePOST)
router.get('/category/:id/delete', categoryController.deleteGET);
router.post('/category/:id/delete', categoryController.deletePOST);
router.get('/lifeperiod/:id/delete', lifePeriodController.deleteGET);
router.post('/lifeperiod/:id/delete', lifePeriodController.deletePOST);





module.exports = router;
