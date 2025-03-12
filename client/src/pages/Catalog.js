import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, Search, ChevronDown } from 'lucide-react';
import GameCard from '../components/GameCard';
import api from '../services/api';

const Catalog = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page')) || 1);
  const [filters, setFilters] = useState({
    platform: queryParams.get('platform') || 'all',
    priceRange: queryParams.get('priceRange') || 'all',
    genre: queryParams.get('genre') || 'all',
    sortBy: queryParams.get('sortBy') || 'relevance',
    search: queryParams.get('search') || ''
  });

  const platforms = [
    { id: 'all', name: 'Todos os Consoles' },
    { id: 'NES', name: 'Nintendo NES' },
    { id: 'SNES', name: 'Super Nintendo' },
    { id: 'Nintendo 64', name: 'Nintendo 64' },
    { id: 'GameBoy', name: 'Game Boy' },
    { id: 'Sega Genesis', name: 'Sega Genesis' },
    { id: 'PlayStation', name: 'PlayStation' },
    { id: 'PlayStation 2', name: 'PlayStation 2' }
  ];

  const priceRanges = [
    { id: 'all', name: 'Todos os Preços' },
    { id: 'under-100', name: 'Até R$ 100' },
    { id: '100-200', name: 'R$ 100 - R$ 200' },
    { id: '200-300', name: 'R$ 200 - R$ 300' },
    { id: 'over-300', name: 'Acima de R$ 300' }
  ];

  const genres = [
    { id: 'all', name: 'Todos os Gêneros' },
    { id: 'Ação', name: 'Ação' },
    { id: 'Aventura', name: 'Aventura' },
    { id: 'RPG', name: 'RPG' },
    { id: 'Plataforma', name: 'Plataforma' },
    { id: 'Luta', name: 'Luta' }
  ];

  const sortOptions = [
    { id: 'relevance', name: 'Mais Relevantes' },
    { id: 'price_asc', name: 'Menor Preço' },
    { id: 'price_desc', name: 'Maior Preço' },
    { id: 'rating', name: 'Melhor Avaliados' },
    { id: 'newest', name: 'Mais Recentes' }
  ];

  useEffect(() => {
    fetchProducts();
    // Atualiza a URL com os filtros
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    if (currentPage > 1) {
      params.set('page', currentPage);
    }
    navigate(`?${params.toString()}`, { replace: true });
  }, [filters, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12
      };

      // Adiciona filtros à query
      if (filters.platform !== 'all') params.platform = filters.platform;
      if (filters.genre !== 'all') params.genre = filters.genre;
      if (filters.sortBy !== 'relevance') params.sort = filters.sortBy;
      if (filters.search) params.search = filters.search;

      // Adiciona filtro de preço
      if (filters.priceRange !== 'all') {
        const [min, max] = getPriceRange(filters.priceRange);
        if (min) params.minPrice = min;
        if (max) params.maxPrice = max;
      }

      const response = await api.get('/products', { params });
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar produtos');
      setLoading(false);
    }
  };

  const getPriceRange = (range) => {
    switch (range) {
      case 'under-100': return [0, 100];
      case '100-200': return [100, 200];
      case '200-300': return [200, 300];
      case 'over-300': return [300, null];
      default: return [null, null];
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', e.target.search.value);
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
          onClick={() => fetchProducts()}
          className="mt-4 btn-primary"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho do Catálogo */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Catálogo de Jogos</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <input
              type="search"
              name="search"
              placeholder="Buscar jogos..."
              defaultValue={filters.search}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </form>
          
          <div className="flex items-center space-x-4">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtros */}
        <div className="md:w-64 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="font-bold mb-4 flex items-center">
              <Filter className="mr-2" size={20} />
              Filtros
            </h2>
            
            {/* Filtro por Plataforma */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Plataforma</h3>
              <select
                value={filters.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {platforms.map(platform => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Gênero */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Gênero</h3>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Faixa de Preço */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Faixa de Preço</h3>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {priceRanges.map(range => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Jogos */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <GameCard key={product._id} game={product} />
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === i + 1
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Próximo
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog; 