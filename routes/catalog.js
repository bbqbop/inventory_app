const express = require('express');
const router = express.Router();
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

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
router.post('/dino/create', upload.single('image'), dinoController.createPOST)
router.get('/category/create', categoryController.createGET)
router.post('/category/create', upload.none(), categoryController.createPOST)
router.get('/lifeperiod/create', lifePeriodController.createGET)
router.post('/lifeperiod/create', upload.none(), lifePeriodController.createPOST)

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
// Delete image //
router.post('/dino/:id/deleteimg', dinoController.deleteImgPOST)

// Update entries //
router.get('/dino/:id/update', dinoController.updateGET)
router.post('/dino/:id/update', upload.single('image'), dinoController.updatePOST)
router.get('/category/:id/update', categoryController.updateGET)
router.post('/category/:id/update', upload.none(), categoryController.updatePOST)
router.get('/lifeperiod/:id/update', lifePeriodController.updateGET)
router.post('/lifeperiod/:id/update', upload.none(), lifePeriodController.updatePOST)



module.exports = router;
