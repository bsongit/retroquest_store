import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaCreditCard, 
  FaBarcode, 
  FaQrcode, 
  FaMapMarkerAlt, 
  FaCity, 
  FaHome, 
  FaBuilding,
  FaMapPin,
  FaRegEnvelope,
  FaUser,
  FaCalendarAlt,
  FaLock
} from 'react-icons/fa';
import api from '../services/api';
import { formatCurrency } from '../utils/format';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState({
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const inputBaseStyle = "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-30 transition-colors duration-200";
  const labelBaseStyle = "block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2";

  useEffect(() => {
    if (user?.address) {
      setAddress(user.address);
    }
  }, [user]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderData = {
        items: cart.items,
        total: cart.subtotal,
        shippingAddress: address,
        paymentMethod,
        paymentDetails: paymentMethod === 'credit_card' ? cardData : null
      };

      const response = await api.post('/orders', orderData);
      navigate(`/pedido/${response.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Carrinho Vazio</h1>
        <p className="text-gray-600 mb-4">Adicione produtos ao seu carrinho antes de prosseguir com o checkout.</p>
        <button
          onClick={() => navigate('/produtos')}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
        >
          Ver Produtos
        </button>
      </div>
    );
  }

  const subtotal = cart.items.reduce((acc, item) => {
    const itemTotal = (item.product?.price || 0) * (item.quantity || 0);
    return acc + itemTotal;
  }, 0);

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center">Finalizar Compra</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resumo do Pedido */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Resumo do Pedido</h2>
          {cart.items.map((item) => (
            <div key={item.product._id} className="flex justify-between mb-4 py-2 border-b">
              <div>
                <span className="font-medium">{item.product.title}</span>
                <span className="text-gray-600"> x {item.quantity}</span>
              </div>
              <span className="font-medium">{formatCurrency((item.product?.price || 0) * (item.quantity || 0))}</span>
            </div>
          ))}
          <div className="border-t mt-6 pt-4">
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Frete</span>
              <span className="text-green-600 font-medium">Grátis</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-primary">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </div>

        {/* Formulário de Entrega e Pagamento */}
        <div className="space-y-6">
          {/* Endereço de Entrega */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Endereço de Entrega</h2>
            <div className="space-y-4">
              <div>
                <label className={labelBaseStyle}>
                  <FaMapPin className="text-primary" />
                  CEP
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={address.zipCode}
                  onChange={handleAddressChange}
                  className={inputBaseStyle}
                  placeholder="00000-000"
                  required
                />
              </div>
              <div>
                <label className={labelBaseStyle}>
                  <FaHome className="text-primary" />
                  Rua
                </label>
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  className={inputBaseStyle}
                  placeholder="Nome da rua"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelBaseStyle}>
                    <FaBuilding className="text-primary" />
                    Número
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={address.number}
                    onChange={handleAddressChange}
                    className={inputBaseStyle}
                    placeholder="123"
                    required
                  />
                </div>
                <div>
                  <label className={labelBaseStyle}>
                    <FaHome className="text-primary" />
                    Complemento
                  </label>
                  <input
                    type="text"
                    name="complement"
                    value={address.complement}
                    onChange={handleAddressChange}
                    className={inputBaseStyle}
                    placeholder="Apto, Bloco, etc"
                  />
                </div>
              </div>
              <div>
                <label className={labelBaseStyle}>
                  <FaMapMarkerAlt className="text-primary" />
                  Bairro
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={address.neighborhood}
                  onChange={handleAddressChange}
                  className={inputBaseStyle}
                  placeholder="Nome do bairro"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelBaseStyle}>
                    <FaCity className="text-primary" />
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    className={inputBaseStyle}
                    placeholder="Nome da cidade"
                    required
                  />
                </div>
                <div>
                  <label className={labelBaseStyle}>
                    <FaMapMarkerAlt className="text-primary" />
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    className={inputBaseStyle}
                    placeholder="UF"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Método de Pagamento */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Método de Pagamento</h2>
            <div className="space-y-4">
              {/* Cartão de Crédito */}
              <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary focus:ring-primary"
                    required
                  />
                  <span className="flex items-center">
                    <FaCreditCard className="mr-2" />
                    Cartão de Crédito
                  </span>
                </label>
                {paymentMethod === 'credit_card' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className={labelBaseStyle}>
                        <FaCreditCard className="text-primary" />
                        Número do Cartão
                      </label>
                      <input
                        type="text"
                        name="number"
                        value={cardData.number}
                        onChange={handleCardChange}
                        className={inputBaseStyle}
                        placeholder="0000 0000 0000 0000"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelBaseStyle}>
                        <FaUser className="text-primary" />
                        Nome no Cartão
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={cardData.name}
                        onChange={handleCardChange}
                        className={inputBaseStyle}
                        placeholder="Nome como está no cartão"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelBaseStyle}>
                          <FaCalendarAlt className="text-primary" />
                          Validade
                        </label>
                        <input
                          type="text"
                          name="expiry"
                          value={cardData.expiry}
                          onChange={handleCardChange}
                          placeholder="MM/AA"
                          className={inputBaseStyle}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelBaseStyle}>
                          <FaLock className="text-primary" />
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          className={inputBaseStyle}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Boleto */}
              <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="boleto"
                    checked={paymentMethod === 'boleto'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary focus:ring-primary"
                    required
                  />
                  <span className="flex items-center">
                    <FaBarcode className="mr-2" />
                    Boleto
                  </span>
                </label>
              </div>

              {/* PIX */}
              <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pix"
                    checked={paymentMethod === 'pix'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary focus:ring-primary"
                    required
                  />
                  <span className="flex items-center">
                    <FaQrcode className="mr-2" />
                    PIX
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Botão de Finalizar */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || !paymentMethod || !address.zipCode || !address.street || !address.number || !address.neighborhood || !address.city || !address.state}
            className="w-full bg-primary text-white py-4 px-6 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold transition-colors"
          >
            {loading ? 'Processando...' : 'Finalizar Compra'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 