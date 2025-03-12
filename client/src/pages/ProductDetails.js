import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { FaShoppingCart, FaHeart, FaStar, FaStarHalf } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { formatCurrency } from '../utils/format';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar o produto. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, quantity);
      alert('Produto adicionado ao carrinho!');
    } catch (err) {
      alert('Erro ao adicionar ao carrinho. Por favor, tente novamente.');
    }
  };

  const handleToggleWishlist = async () => {
    try {
      await api.post(`/users/wishlist/${product._id}`);
      alert('Lista de desejos atualizada!');
    } catch (err) {
      alert('Erro ao atualizar lista de desejos. Por favor, tente novamente.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-500" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalf key="half-star" className="text-yellow-500" />);
    }

    return stars;
  };

  if (loading) return <div className="container mx-auto p-4">Carregando...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!product) return <div className="container mx-auto p-4">Produto não encontrado</div>;

  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Carrossel de Imagens */}
        <div className="bg-white rounded-lg shadow-lg">
          <Carousel
            showArrows={true}
            showStatus={false}
            showThumbs={true}
            infiniteLoop={true}
            className="product-carousel"
          >
            {product.images.sort((a, b) => a.order - b.order).map((image, index) => (
              <div key={index}>
                <img src={image.url} alt={image.alt} className="object-cover h-96 w-full" />
              </div>
            ))}
          </Carousel>
        </div>

        {/* Informações do Produto */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex mr-2">
              {renderStars(product.rating)}
            </div>
            <span className="text-gray-600">({product.numberOfReviews} avaliações)</span>
          </div>

          <div className="mb-4">
            <span className="text-gray-600 line-through text-lg mr-2">
              {formatCurrency(product.price)}
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(discountedPrice)}
            </span>
            {product.discount > 0 && (
              <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
                -{product.discount}%
              </span>
            )}
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="font-semibold">Plataforma:</span>
                <p>{product.platform}</p>
              </div>
              <div>
                <span className="font-semibold">Estado:</span>
                <p>{product.condition}</p>
              </div>
              <div>
                <span className="font-semibold">Ano de Lançamento:</span>
                <p>{product.releaseYear}</p>
              </div>
              <div>
                <span className="font-semibold">Gênero:</span>
                <p>{product.genre.join(', ')}</p>
              </div>
            </div>

            <div className="mb-4">
              <span className="font-semibold">Publisher:</span>
              <p>{product.publisher}</p>
            </div>
            <div className="mb-4">
              <span className="font-semibold">Developer:</span>
              <p>{product.developer}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Características:</h2>
            <ul className="list-disc list-inside">
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Descrição:</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <button
                className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="px-4 py-2">{quantity}</span>
              <button
                className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark flex items-center justify-center gap-2"
            >
              <FaShoppingCart />
              {product.stock === 0 ? 'Fora de Estoque' : 'Adicionar ao Carrinho'}
            </button>

            <button
              onClick={handleToggleWishlist}
              className="p-2 text-gray-600 hover:text-red-500 rounded-lg border"
            >
              <FaHeart />
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Reviews */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Avaliações</h2>
        {product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review, index) => (
              <div key={index} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-gray-600">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Ainda não há avaliações para este produto.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails; 