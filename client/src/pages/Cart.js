import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import api from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingItem, setProcessingItem] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar o carrinho');
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setProcessingItem(productId);
      await api.put(`/cart/${productId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (err) {
      console.error('Erro ao atualizar quantidade:', err);
    } finally {
      setProcessingItem(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setProcessingItem(productId);
      await api.delete(`/cart/${productId}`);
      await fetchCart();
    } catch (err) {
      console.error('Erro ao remover item:', err);
    } finally {
      setProcessingItem(null);
    }
  };

  const handleCheckout = async () => {
    try {
      // Aqui você pode adicionar a lógica de checkout
      // Por exemplo, redirecionar para a página de pagamento
      navigate('/checkout');
    } catch (err) {
      console.error('Erro ao processar checkout:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchCart}
          className="mt-4 btn-primary"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-500 mb-8">Explore nosso catálogo e encontre jogos incríveis!</p>
          <Link to="/catalogo" className="btn-primary">
            Explorar Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista de Itens */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              {cart.items.map((item) => (
                <div 
                  key={item.product._id} 
                  className={`p-6 flex items-center ${
                    processingItem === item.product._id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-24 h-24">
                    <img
                      src={item.product.images[0]?.url || 'https://placehold.co/200x200?text=Sem+Imagem'}
                      alt={item.product.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="ml-6 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link to={`/produto/${item.product._id}`} className="hover:text-primary-600">
                            {item.product.title}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{item.product.platform}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="text-gray-400 hover:text-red-500"
                        disabled={processingItem === item.product._id}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100"
                          disabled={processingItem === item.product._id}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100"
                          disabled={processingItem === item.product._id}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        {item.product.discount > 0 && (
                          <p className="text-sm text-gray-500 line-through">
                            R$ {(item.product.price * item.quantity / (1 - item.product.discount / 100)).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo do Pedido</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-base text-gray-900">
                <span>Subtotal</span>
                <span>R$ {cart.subtotal? cart.subtotal.toFixed(2) : 0}</span>
              </div>
              
              {cart.discount > 0 && (
                <div className="flex justify-between text-base text-green-600">
                  <span>Desconto</span>
                  <span>- R$ {cart.discount? cart.discount.toFixed(2) : 0}</span>
                </div>
              )}
              
              <div className="flex justify-between text-base text-gray-900 font-medium">
                <span>Total</span>
                <span>R$ {cart.total? cart.total.toFixed(2) : 0}</span>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary py-3 text-base font-medium"
                >
                  Finalizar Compra
                </button>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/catalogo"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 