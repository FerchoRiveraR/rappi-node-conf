const _ = require('lodash');
const ProductServices = require('../services/ProductServices');

const ProductsController = module.exports;

ProductsController.getProducts = async (req, res) => {
  const { quantity } = req.params;

  ProductServices.getProducts(parseInt(quantity, 10) || 0).then(produts => (res.status(200).send(produts)))
    .catch(err => (res.status(500).send(err.message)));
};
