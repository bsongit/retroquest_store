const express = require('express');
const router = express.Router();
const { Cart, Product } = require('../models');
const { auth } = require('../middleware/auth');

// Obter carrinho do usuário
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    const total = await cart.calculateTotal();
    
    res.json({
      items: cart.items,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar carrinho', error: error.message });
  }
});

// Adicionar item ao carrinho
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Verifica se o produto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Verifica o estoque
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Quantidade insuficiente em estoque' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Verifica se o produto já está no carrinho
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Atualiza a quantidade se o produto já existe
      cart.items[itemIndex].quantity = quantity;
    } else {
      // Adiciona novo item
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');
    
    const total = await cart.calculateTotal();

    res.json({
      message: 'Item adicionado ao carrinho',
      items: cart.items,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar item ao carrinho', error: error.message });
  }
});

// Atualizar quantidade de um item
router.put('/:productId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    // Verifica se o produto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Verifica o estoque
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Quantidade insuficiente em estoque' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Carrinho não encontrado' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item não encontrado no carrinho' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    
    const total = await cart.calculateTotal();

    res.json({
      message: 'Quantidade atualizada',
      items: cart.items,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar quantidade', error: error.message });
  }
});

// Remover item do carrinho
router.delete('/:productId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Carrinho não encontrado' });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await cart.save();
    await cart.populate('items.product');
    
    const total = await cart.calculateTotal();

    res.json({
      message: 'Item removido do carrinho',
      items: cart.items,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover item do carrinho', error: error.message });
  }
});

// Limpar carrinho
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Carrinho não encontrado' });
    }

    cart.items = [];
    await cart.save();

    res.json({
      message: 'Carrinho limpo com sucesso',
      items: [],
      total: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao limpar carrinho', error: error.message });
  }
});

module.exports = router; 