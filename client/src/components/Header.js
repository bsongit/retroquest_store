import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, ShoppingCart, User, Heart, ChevronDown } from 'lucide-react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  return (
    <header className="bg-primary-900 text-white">
      {/* Header Superior */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="mr-3 md:hidden"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="text-2xl font-bold">
              RetroQuest
            </Link>
          </div>

          {/* Barra de Pesquisa */}
          <div className="hidden md:flex items-center space-x-6 flex-1 max-w-md ml-8">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Buscar jogos..." 
                className="w-full py-2 px-4 rounded-full bg-primary-800 focus:bg-white focus:text-gray-900 transition-colors"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2" size={18} />
            </div>
          </div>

          {/* Ícones de Ação */}
          <div className="flex items-center space-x-4">
            <button className="relative" aria-label="Lista de Desejos">
              <Heart size={24} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
            <Link to="/carrinho" className="relative" aria-label="Carrinho">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/perfil" className="hidden md:block" aria-label="Perfil">
              <User size={24} />
            </Link>
          </div>
        </div>

        {/* Barra de Pesquisa Mobile */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar jogos..." 
              className="w-full py-2 px-4 rounded-lg bg-primary-800 focus:bg-white focus:text-gray-900 transition-colors"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2" size={18} />
          </div>
        </div>
      </div>

      {/* Menu de Navegação */}
      <nav className="hidden md:block bg-primary-800">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-8 justify-center py-2">
            <li><Link to="/" className="hover:text-primary-200 font-medium">Início</Link></li>
            <li><Link to="/catalogo" className="hover:text-primary-200 font-medium">Catálogo</Link></li>
            <li><Link to="/consoles" className="hover:text-primary-200 font-medium">Consoles</Link></li>
            <li><Link to="/acessorios" className="hover:text-primary-200 font-medium">Acessórios</Link></li>
            <li><Link to="/blog" className="hover:text-primary-200 font-medium">Blog</Link></li>
            <li><Link to="/sobre" className="hover:text-primary-200 font-medium">Sobre</Link></li>
            <li><Link to="/contato" className="hover:text-primary-200 font-medium">Contato</Link></li>
          </ul>
        </div>
      </nav>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="bg-white h-full w-3/4 max-w-xs p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button 
                onClick={() => setMenuOpen(false)} 
                className="text-gray-600"
                aria-label="Fechar menu"
              >
                <ChevronDown size={24} />
              </button>
            </div>
            
            <nav>
              <ul className="space-y-4">
                <li className="border-b pb-2">
                  <Link to="/" className="block font-medium text-gray-900">Início</Link>
                </li>
                <li className="border-b pb-2">
                  <Link to="/catalogo" className="block font-medium text-gray-900">Catálogo</Link>
                </li>
                <li className="border-b pb-2">
                  <Link to="/consoles" className="block font-medium text-gray-900">Consoles</Link>
                </li>
                <li className="border-b pb-2">
                  <Link to="/acessorios" className="block font-medium text-gray-900">Acessórios</Link>
                </li>
                <li className="border-b pb-2">
                  <Link to="/blog" className="block font-medium text-gray-900">Blog</Link>
                </li>
                <li className="border-b pb-2">
                  <Link to="/sobre" className="block font-medium text-gray-900">Sobre</Link>
                </li>
                <li className="border-b pb-2">
                  <Link to="/contato" className="block font-medium text-gray-900">Contato</Link>
                </li>
                <li className="pt-4">
                  <Link to="/login" className="block font-medium text-primary-600">Entrar / Cadastrar</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 