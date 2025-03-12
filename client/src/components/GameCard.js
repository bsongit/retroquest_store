import React, { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useApp } from '../contexts/AppContext';

const GameCard = ({ game }) => {
  const {
    _id,
    title,
    platform,
    price,
    images,
    discount,
    isWishlisted = false
  } = game;

  const { addToCart } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const result = await addToCart(_id, 1);
      if (!result.success) {
        throw new Error(result.error);
      }
      // Aqui você pode adicionar uma notificação de sucesso
    } catch (error) {
      // Aqui você pode adicionar uma notificação de erro
      console.error('Erro ao adicionar ao carrinho:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${_id}`);
      } else {
        await api.post('/wishlist', { productId: _id });
      }
      // Aqui você pode adicionar uma notificação de sucesso
    } catch (error) {
      // Aqui você pode adicionar uma notificação de erro
      console.error('Erro ao atualizar lista de desejos:', error);
    }
  };

  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/produto/${_id}`} className="block relative">
        <img 
          src={images[0]?.url || 'https://placehold.co/600x400?text=Sem+Imagem'} 
          alt={images[0]?.alt || title} 
          className="w-full h-48 object-cover"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        <button 
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors ${
            isWishlisted 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
          aria-label={isWishlisted ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
        >
          <Heart size={16} />
        </button>
      </Link>
      
      <div className="p-4">
        <span className="text-xs text-gray-500 block mb-1">{platform}</span>
        <Link to={`/produto/${_id}`} className="block">
          <h3 className="font-medium text-sm md:text-base line-clamp-2 mb-2 hover:text-primary-600">
            {title}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center">
          <div>
            {discount > 0 ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 line-through">
                  R$ {price.toFixed(2)}
                </span>
                <span className="font-bold text-lg text-red-500">
                  R$ {discountedPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="font-bold text-lg">
                R$ {price.toFixed(2)}
              </span>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={isProcessing}
            className={`${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700'
            } text-white p-2 rounded-full transition-colors`}
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard; 