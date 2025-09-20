import mongoose from 'mongoose';
import { contactsRouter } from '../routes/contacts.js';

export const initMongoConnection = async () => {
  try {
    const user = contactsRouter('MONGODB_USER');
    const pwd = contactsRouter('MONGODB_PASSWORD');
    const url = contactsRouter('MONGODB_URL');
    const db = contactsRouter('MONGODB_DB');

    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority`,
    );
    console.log('Mongo connection successfully established!');
  } catch (e) {
    console.log('Error while setting up mongo connection', e);
    throw e;
  }
};
