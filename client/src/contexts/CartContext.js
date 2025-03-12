import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
      setLoading(false);
    }
  }, [user]);

  const checkAuth = () => {
    if (!user) {
      throw new Error('Você precisa estar logado para realizar esta operação');
    }
  };

  const fetchCart = async () => {
    try {
      checkAuth();
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    try {
      checkAuth();
      const response = await api.post('/cart', { productId, quantity });
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      throw error;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      checkAuth();
      const response = await api.put(`/cart/${productId}`, { quantity });
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar item do carrinho:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      checkAuth();
      const response = await api.delete(`/cart/${productId}`);
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      checkAuth();
      const response = await api.delete('/cart');
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      throw error;
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    isAuthenticated: !!user
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext; 