const express = require('express');
const router = express.Router();
const { Order, Cart } = require('../models');
const { auth, admin } = require('../middleware/auth');

// Criar pedido
router.post('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Carrinho vazio' });
    }

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      title: item.product.title,
      quantity: item.quantity,
      price: item.product.price,
      discount: item.product.discount
    }));

    const subtotal = await cart.calculateTotal();
    const shippingPrice = 10.00; // Valor fixo para exemplo
    const total = subtotal + shippingPrice;

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      subtotal,
      shippingPrice,
      total
    });

    await order.save();

    // Limpa o carrinho após criar o pedido
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar pedido', error: error.message });
  }
});

// Listar pedidos do usuário
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedidos', error: error.message });
  }
});

// Buscar pedido por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Verifica se o pedido pertence ao usuário ou se é admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedido', error: error.message });
  }
});

// Atualizar status do pedido (admin)
router.put('/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    order.status = status;
    
    if (status === 'shipped' && !order.trackingCode) {
      order.trackingCode = `RQ${Date.now()}`;
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar status', error: error.message });
  }
});

// Confirmar pagamento do pedido (admin)
router.put('/:id/payment', [auth, admin], async (req, res) => {
  try {
    const { transactionId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    order.paymentDetails = {
      status: 'paid',
      transactionId,
      paidAt: new Date()
    };

    order.status = 'processing';
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao confirmar pagamento', error: error.message });
  }
});

// Cancelar pedido
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Verifica se o pedido pertence ao usuário ou se é admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Verifica se o pedido pode ser cancelado
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: 'Pedido não pode ser cancelado' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cancelar pedido', error: error.message });
  }
});

// Listar todos os pedidos (admin)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar pedidos', error: error.message });
  }
});

module.exports = router; 