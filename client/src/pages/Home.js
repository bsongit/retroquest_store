import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import GameCard from '../components/GameCard';
import api from '../services/api';

const Home = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const consoleCategories = [
    { name: "Nintendo NES", count: 42, image: "https://placehold.co/200x200?text=NES" },
    { name: "Super Nintendo", count: 38, image: "https://placehold.co/200x200?text=SNES" },
    { name: "Nintendo 64", count: 26, image: "https://placehold.co/200x200?text=N64" },
    { name: "Sega Genesis", count: 31, image: "https://placehold.co/200x200?text=Genesis" },
    { name: "PlayStation", count: 45, image: "https://placehold.co/200x200?text=PS1" },
    { name: "PlayStation 2", count: 63, image: "https://placehold.co/200x200?text=PS2" },
    { name: "Xbox", count: 29, image: "https://placehold.co/200x200?text=Xbox" },
    { name: "Game Boy", count: 34, image: "https://placehold.co/200x200?text=GameBoy" }
  ];

  useEffect(() => {
    const fetchFeaturedGames = async () => {
      try {
        const response = await api.get('/products', {
          params: {
            limit: 4,
            sort: 'rating'
          }
        });
        setFeaturedGames(response.data.products);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar jogos em destaque');
        setLoading(false);
      }
    };

    fetchFeaturedGames();
  }, []);

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
          onClick={() => window.location.reload()}
          className="mt-4 btn-primary"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="md:flex md:items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Redescubra os Clássicos da Sua Infância
              </h1>
              <p className="text-lg md:text-xl mb-6 text-primary-100">
                Explore nossa coleção de jogos retrô cuidadosamente preservados, consoles e acessórios.
              </p>
              <div className="flex space-x-4">
                <Link to="/catalogo" className="btn-primary">
                  Explorar Catálogo
                </Link>
                <Link to="/sobre" className="btn-secondary">
                  Saiba Mais
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://placehold.co/800x600?text=Retro+Games+Collection" 
                alt="Coleção de Jogos Retrô" 
                className="rounded-lg shadow-xl mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Jogos em Destaque */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Jogos em Destaque</h2>
            <Link to="/catalogo" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              Ver Todos <ArrowRight className="ml-1" size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGames.map(game => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>
        </div>
      </section>

      {/* Categorias por Console */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Compre por Console</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {consoleCategories.map((console, index) => (
              <Link 
                key={index}
                to={`/catalogo?console=${console.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className="w-16 h-16 mx-auto mb-3">
                  <img 
                    src={console.image} 
                    alt={console.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="font-medium text-sm md:text-base">{console.name}</h3>
                <span className="text-xs text-gray-500">{console.count} jogos</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 