const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware de validação
const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres' });
  }
  
  next();
};

// Registro de usuário
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Cria o novo usuário
    const user = new User({
      name,
      email,
      password,
      phone,
      address
    });

    await user.save();

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar usuário', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica se o usuário existe
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos', success: false });
    }

    // Verifica a senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou senha inválidos' , success: false});
    }

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message, success: false });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

module.exports = router; 