const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido.' });
  }
};

const admin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar permissões.' });
  }
};

module.exports = { auth, admin }; 