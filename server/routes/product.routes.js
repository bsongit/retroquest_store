const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { auth, admin } = require('../middleware/auth');

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const { platform, genre, sort, page = 1, limit = 12 } = req.query;
    const query = {};
    const sortOptions = {};

    // Filtros
    if (platform) query.platform = platform;
    if (genre) query.genre = genre;

    // Ordenação
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOptions.price = 1;
          break;
        case 'price_desc':
          sortOptions.price = -1;
          break;
        case 'newest':
          sortOptions.createdAt = -1;
          break;
        case 'rating':
          sortOptions.rating = -1;
          break;
      }
    }

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produto', error: error.message });
  }
});

// Criar produto (admin)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
  }
});

// Atualizar produto (admin)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
  }
});

// Deletar produto (admin)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar produto', error: error.message });
  }
});

// Adicionar review
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Verifica se o usuário já fez uma review
    const alreadyReviewed = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Você já avaliou este produto' });
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review adicionada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar review', error: error.message });
  }
});

// Buscar produtos por termo
router.get('/search/:term', async (req, res) => {
  try {
    const products = await Product.find({
      $text: { $search: req.params.term }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
  }
});

module.exports = router; 