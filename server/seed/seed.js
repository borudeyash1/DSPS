
const mongoose = require('mongoose');

const Product = require("./models/Product");

mongoose.connect(process.env.MONGODB_URI || 'mongodb://devops-db-mongodb-baf43fbb-3797-403c-9a5d-da9c98016028:27017/preview_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to the database');
}).catch(err => {
  console.error('Failed to connect to the database', err);
  process.exit(1);
});

const products = [
  {
    name: 'Product 1',
    description: 'This is product 1',
    price: 100,
    stock: 10,
    category: 'Electronics',
    images: [
      'server/uploads/1765635021333-749871562-Screenshot-2025-12-10-235333.png',
      'server/uploads/1765635078707-535470534-Screenshot-2025-12-10-235333.png',
      'server/uploads/1765635087817-57824280-Screenshot-2025-12-10-235459.png'
    ]
  },
  {
    name: 'Product 2',
    description: 'This is product 2',
    price: 200,
    stock: 5,
    category: 'Clothing',
    images: [
      'server/uploads/1765635254913-88709137-Screenshot-2025-12-11-002415.png',
      'server/uploads/1765635266571-695032490-Screenshot-2025-12-10-235333.png'
    ]
  }
];

Product.insertMany(products)
  .then(() => {
    console.log('Products seeded successfully');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Failed to seed products', err);
    mongoose.connection.close();
  });
