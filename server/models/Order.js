const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    title: String,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantidade deve ser pelo menos 1']
    },
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    }
  }],
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    },
    complement: String,
    neighborhood: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'pix', 'boleto']
  },
  paymentDetails: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  shippingPrice: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  trackingCode: String,
  notes: String,
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

// Método virtual para calcular o total do pedido
orderSchema.virtual('orderTotal').get(function() {
  const itemsTotal = this.items.reduce((total, item) => {
    const itemPrice = item.price * (1 - item.discount / 100);
    return total + (itemPrice * item.quantity);
  }, 0);
  
  return itemsTotal + this.shippingPrice;
});

// Middleware para atualizar o estoque após a confirmação do pedido
orderSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'processing') {
    const Product = mongoose.model('Product');
    
    for (const item of this.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 