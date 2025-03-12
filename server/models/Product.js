const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título do produto é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Descrição do produto é obrigatória']
  },
  platform: {
    type: String,
    required: [true, 'Plataforma é obrigatória'],
    enum: [
      'NES',
      'SNES',
      'Nintendo 64',
      'GameBoy',
      'GameBoy Color',
      'GameBoy Advance',
      'Sega Master System',
      'Sega Genesis',
      'Sega CD',
      'Sega Saturn',
      'Sega Dreamcast',
      'PlayStation',
      'PlayStation 2',
      'Xbox'
    ]
  },
  condition: {
    type: String,
    required: [true, 'Condição do produto é obrigatória'],
    enum: ['Novo', 'Como Novo', 'Bom', 'Regular']
  },
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço não pode ser negativo']
  },
  discount: {
    type: Number,
    min: [0, 'Desconto não pode ser negativo'],
    max: [100, 'Desconto não pode ser maior que 100%'],
    default: 0
  },
  stock: {
    type: Number,
    required: [true, 'Quantidade em estoque é obrigatória'],
    min: [0, 'Estoque não pode ser negativo']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  features: [{
    type: String
  }],
  releaseYear: {
    type: Number,
    required: true
  },
  publisher: {
    type: String,
    required: true
  },
  developer: {
    type: String,
    required: true
  },
  genre: [{
    type: String,
    enum: [
      'Ação',
      'Aventura',
      'RPG',
      'Estratégia',
      'Esporte',
      'Corrida',
      'Luta',
      'Plataforma',
      'Puzzle',
      'Tiro',
      'Simulação'
    ]
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  numberOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para melhorar a performance das buscas
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ platform: 1 });
productSchema.index({ genre: 1 });
productSchema.index({ price: 1 });

// Método virtual para calcular o preço com desconto
productSchema.virtual('finalPrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 