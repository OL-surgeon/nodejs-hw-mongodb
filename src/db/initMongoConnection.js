const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const initMongoConnection = async () => {
  const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } =
    process.env;

  const MONGODB_URI = `mongodb+srv://${MONGODB_USER}:${encodeURIComponent(
    MONGODB_PASSWORD,
  )}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.error('Mongo connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = initMongoConnection;
