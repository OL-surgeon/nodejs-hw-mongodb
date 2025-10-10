import mongoose from 'mongoose';
import { contactsRout } from '../routes/contacts.js';

export const initMongoConnection = async () => {
  try {
    const user = contactsRout('MONGODB_USER');
    const pwd = contactsRout('MONGODB_PASSWORD');
    const url = contactsRout('MONGODB_URL');
    const db = contactsRout('MONGODB_DB');

    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority`,
    );
    console.log('Mongo connection successfully established!');
  } catch (e) {
    console.log('Error while setting up mongo connection', e);
    throw e;
  }
};
