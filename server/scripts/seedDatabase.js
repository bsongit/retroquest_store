const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const MONGODB_URI = 'mongodb+srv://werbeson:EWGsEqYwXlprGIse@cluster0.w4emw.mongodb.net/webstore?retryWrites=true&w=majority&appName=Cluster0';

// Arrays para gerar dados aleatórios
const platforms = [
  'NES', 'SNES', 'Nintendo 64', 'GameBoy', 'GameBoy Color', 'GameBoy Advance',
  'Sega Master System', 'Sega Genesis', 'Sega CD', 'Sega Saturn', 'Sega Dreamcast',
  'PlayStation', 'PlayStation 2', 'Xbox'
];

const conditions = ['Novo', 'Como Novo', 'Bom', 'Regular'];

const genres = [
  'Ação', 'Aventura', 'RPG', 'Estratégia', 'Esporte',
  'Corrida', 'Luta', 'Plataforma', 'Puzzle', 'Tiro', 'Simulação'
];

const publishers = [
  'Nintendo', 'Sega', 'Sony', 'Microsoft', 'Capcom',
  'Square Enix', 'Konami', 'Namco', 'Electronic Arts', 'Activision'
];

const developers = [
  'Nintendo EAD', 'Sonic Team', 'Square', 'Rare',
  'Capcom', 'Konami', 'Namco', 'Naughty Dog', 'Bungie'
];

const gameNames = [
  'Super', 'Mega', 'Ultimate', 'Final', 'Legend of', 'Tales of',
  'Sonic', 'Mario', 'Dragon', 'Fantasy', 'Quest', 'Warriors',
  'Racing', 'Fighter', 'World', 'Adventure', 'Chronicles'
];

const gameTypes = [
  'Adventure', 'Quest', 'Story', 'Chronicles', 'Legacy',
  'Saga', 'Revolution', 'Warriors', 'Legends', 'Fantasy'
];

// Funções auxiliares
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Função para gerar um nome de jogo aleatório
const generateGameTitle = () => {
  const name = getRandomItem(gameNames);
  const type = getRandomItem(gameTypes);
  return `${name} ${type}`;
};

// Função para gerar um nome de usuário aleatório
const generateUsername = (index) => {
  const names = ['João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Julia', 'Carlos', 'Paula', 'Fernando', 'Mariana'];
  const surnames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Costa', 'Rodrigues'];
  
  const name = getRandomItem(names);
  const surname = getRandomItem(surnames);
  return {
    name: `${name} ${surname}`,
    email: `${name.toLowerCase()}${index}@email.com`,
    password: 'senha123'
  };
};

// Função principal para popular o banco de dados
async function seedDatabase() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB');

    // Limpar o banco de dados
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({})
    ]);
    console.log('Banco de dados limpo');

    // Criar usuários
    const users = [];
    // Criar admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@email.com',
      password: adminPassword,
      isAdmin: true
    });
    users.push(admin);

    // Criar usuários normais
    for (let i = 0; i < 9; i++) {
      const userData = generateUsername(i);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword
      });
      users.push(user);
    }
    console.log('10 usuários criados');

    // Criar produtos
    const products = [];
    for (let i = 0; i < 100; i++) {
      const product = await Product.create({
        title: generateGameTitle(),
        description: `Um jogo incrível para ${getRandomItem(platforms)}`,
        platform: getRandomItem(platforms),
        condition: getRandomItem(conditions),
        price: getRandomNumber(50, 500),
        discount: Math.random() < 0.3 ? getRandomNumber(10, 30) : 0,
        stock: getRandomNumber(0, 20),
        images: [
          {
            url: `https://picsum.photos/400/400?random=${i}`,
            alt: 'Imagem do produto',
            isPrimary: true,
            order: 0
          },
          {
            url: `https://picsum.photos/400/400?random=${i + 100}`,
            alt: 'Imagem secundária',
            isPrimary: false,
            order: 1
          }
        ],
        features: [
          'Multiplayer local',
          'História envolvente',
          'Gráficos clássicos',
          'Trilha sonora memorável'
        ],
        releaseYear: getRandomNumber(1985, 2005),
        publisher: getRandomItem(publishers),
        developer: getRandomItem(developers),
        genre: getRandomItems(genres, getRandomNumber(1, 3))
      });
      products.push(product);

      // Adicionar algumas reviews
      const numReviews = getRandomNumber(0, 5);
      for (let j = 0; j < numReviews; j++) {
        const user = getRandomItem(users);
        product.reviews.push({
          user: user._id,
          rating: getRandomNumber(3, 5),
          comment: 'Ótimo jogo! Recomendo!',
          date: getRandomDate(new Date(2023, 0, 1), new Date())
        });
      }
      product.numberOfReviews = product.reviews.length;
      product.rating = product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : 0;
      await product.save();
    }
    console.log('100 produtos criados');

    // Criar carrinhos
    for (let i = 0; i < 10; i++) {
      const user = users[i];
      const numItems = getRandomNumber(1, 5);
      const items = [];
      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        const product = getRandomItem(products);
        const quantity = Math.min(getRandomNumber(1, 3), product.stock);
        if (quantity > 0) {
          const price = product.price * (1 - product.discount / 100);
          
          items.push({
            product: product._id,
            quantity,
            price
          });
          
          subtotal += price * quantity;
        }
      }

      if (items.length > 0) {
        await Cart.create({
          user: user._id,
          items,
          subtotal
        });
      }
    }
    console.log('10 carrinhos criados');

    // Criar pedidos
    const orderStatus = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentStatus = ['pending', 'paid', 'failed'];

    for (let i = 0; i < 20; i++) {
      const user = getRandomItem(users);
      const numItems = getRandomNumber(1, 5);
      const items = [];
      let total = 0;

      for (let j = 0; j < numItems; j++) {
        const product = getRandomItem(products);
        const quantity = Math.min(getRandomNumber(1, 3), product.stock);
        if (quantity > 0) {
          const price = product.price * (1 - product.discount / 100);
          
          items.push({
            product: product._id,
            quantity,
            price
          });
          
          total += price * quantity;
        }
      }

      if (items.length > 0) {
        const orderDate = getRandomDate(new Date(2023, 0, 1), new Date());
        
        await Order.create({
          user: user._id,
          items,
          total,
          status: getRandomItem(orderStatus),
          paymentStatus: getRandomItem(paymentStatus),
          shippingAddress: {
            street: 'Rua Exemplo',
            number: '123',
            complement: 'Apto 45',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01001-000'
          },
          orderDate,
          paymentDate: Math.random() < 0.7 ? getRandomDate(orderDate, new Date()) : null
        });
      }
    }
    console.log('20 pedidos criados');

    // Atualizar wishlists dos usuários
    for (const user of users) {
      const numWishlistItems = getRandomNumber(0, 5);
      const wishlist = getRandomItems(products, numWishlistItems).map(product => product._id);
      await User.findByIdAndUpdate(user._id, { wishlist });
    }
    console.log('Wishlists atualizadas');

    console.log('Banco de dados populado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
    process.exit(1);
  }
}

seedDatabase(); 