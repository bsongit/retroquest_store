const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de produtos
router.use('/products', productRoutes);

// Rotas do carrinho
router.use('/cart', cartRoutes);

// Rotas de pedidos
router.use('/orders', orderRoutes);

module.exports = router; 