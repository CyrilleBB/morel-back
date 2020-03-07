const express = require('express');
const router = express.Router();

const { create, productById, read, remove, update, list, listCategories, image, listSearch } =  require('../controllers/product');
const {requireSignin, isAuth, isAdmin} =  require('../controllers/auth');
const { userById } =  require('../controllers/user');

router.get('/product/:productId', read);
router.post('/product/create/:userId', requireSignin, isAuth, isAdmin, create);
router.delete('/product/:productId/:userId', requireSignin, isAuth, isAdmin, remove);
router.put('/product/:productId/:userId', requireSignin, isAuth, isAdmin, update);
router.get('/products', list);
router.get("/products/search", listSearch);
router.get('/products/categories', listCategories);
router.get('/product/image/:productId', image);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
