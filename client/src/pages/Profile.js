import React, { useContext, useState } from 'react';
import { User, Package, Heart, CreditCard, Settings, LogOut } from 'lucide-react';
import AuthContext from '../contexts/AuthContext';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const { user, logout } = useContext(AuthContext);

  const orders = [
    {
      id: '12345',
      date: '2024-03-01',
      status: 'Entregue',
      total: 109.98,
      items: [
        {
          title: 'Super Mario Bros. 3',
          platform: 'NES',
          quantity: 1,
          price: 49.99
        },
        {
          title: 'The Legend of Zelda: A Link to the Past',
          platform: 'SNES',
          quantity: 1,
          price: 59.99
        }
      ]
    }
  ];

  const wishlist = [
    {
      id: 1,
      title: 'Sonic the Hedgehog 2',
      platform: 'Genesis',
      price: 39.99,
      imageUrl: '/images/games/sonic-2.jpg'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Menu Lateral */}
        <div className="md:w-64">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={32} className="text-primary-600" />
              </div>
              <div className="ml-4">
                <h2 className="font-bold">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'orders' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package className="mr-3" size={20} />
                Meus Pedidos
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'wishlist' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart className="mr-3" size={20} />
                Lista de Desejos
              </button>

              <button
                onClick={() => setActiveTab('payment')}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'payment' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="mr-3" size={20} />
                Formas de Pagamento
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="mr-3" size={20} />
                Configurações
              </button>

              <button className="w-full flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors" onClick={logout}>
                <LogOut className="mr-3" size={20} />
                Sair
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Meus Pedidos</h2>
              
              {orders.map(order => (
                <div key={order.id} className="border-b pb-6 mb-6 last:border-b-0">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-medium">Pedido #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.title} ({item.platform}) x{item.quantity}</span>
                        <span>R$ {item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>R$ {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Lista de Desejos</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{item.platform}</p>
                    <p className="font-bold">R$ {item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Formas de Pagamento</h2>
              <p className="text-gray-500">Em breve...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Configurações</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={user.phone}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <textarea
                    value={user.address}
                    className="input-field"
                    rows="3"
                  />
                </div>

                <button className="btn-primary">
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 