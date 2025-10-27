import { Contact } from '../models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

// =======================
// Отримання всіх контактів з пагінацією, фільтром та сортуванням
// =======================
export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  type,
  isFavourite,
  userId,
}) => {
  const skip = (page - 1) * perPage;
  const filter = { userId };

  if (type) filter.contactType = type;
  if (isFavourite !== undefined) filter.isFavourite = isFavourite;

  const totalItems = await Contact.countDocuments(filter);

  const contactsQuery = Contact.find(filter)
    .skip(skip)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder });

  const contacts = await contactsQuery.exec();
  const totalPages = Math.ceil(totalItems / perPage);

  return {
    contacts,
    totalItems,
    totalPages,
  };
};

// =======================
// Отримати контакт за ID
// =======================
export const getContactById = async (contactId, userId) => {
  return Contact.findOne({ _id: contactId, userId });
};

// =======================
// Створення нового контакту
// =======================
export const createContact = async (contactData, userId) => {
  return Contact.create({ ...contactData, userId });
};

// =======================
// Оновлення контакту
// =======================
export const updateContact = async (contactId, updateData, userId, photo) => {
  const dataToUpdate = { ...updateData };
  if (photo) dataToUpdate.photo = photo;

  const updated = await Contact.findOneAndUpdate(
    { _id: contactId, userId },
    dataToUpdate,
    { new: true },
  );

  if (!updated) return null;

  return { contact: updated };
};

// =======================
// Видалення контакту
// =======================
export const deleteContact = async (contactId, userId) => {
  return Contact.findOneAndDelete({ _id: contactId, userId });
};
