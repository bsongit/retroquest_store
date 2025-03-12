const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantidade deve ser pelo menos 1']
    }
  }],
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

// Método para calcular o total do carrinho
cartSchema.methods.calculateTotal = async function() {
  await this.populate('items.product');
  
  return this.items.reduce((total, item) => {
    const price = item.product.price * (1 - item.product.discount / 100);
    return total + (price * item.quantity);
  }, 0);
};

// Middleware para validar o estoque antes de salvar
cartSchema.pre('save', async function(next) {
  if (this.isModified('items')) {
    const Product = mongoose.model('Product');
    
    for (const item of this.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Produto ${item.product} não encontrado`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Quantidade insuficiente em estoque para ${product.title}`);
      }
    }
  }
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 