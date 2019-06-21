const express = require('express');

const ProductsController = require('./controllers/ProductsController');

const router = express.Router();

// Products
router.get('/nodeconfg/products/:quantity', ProductsController.getProducts);
router.post('/nodeconfg/products',  ProductsController.processProduct);

module.exports = router;
