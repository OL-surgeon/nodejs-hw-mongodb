import { Contact } from '../models/contact.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  type,
  isFavourite,
}) => {
  const skip = (page - 1) * perPage;

  const filter = {};
  if (type) {
    filter.contactType = type;
  }
  if (isFavourite !== undefined) {
    filter.isFavourite = isFavourite === 'true';
  }

  const totalItems = await Contact.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / perPage);

  const sortField = sortBy || 'name';
  const sortDirection = sortOrder === 'desc' ? -1 : 1; // за замовчуванням asc

  const contacts = await Contact.find(filter)
    .sort({ [sortField]: sortDirection })
    .skip(skip)
    .limit(perPage);

  return { contacts, totalItems, totalPages };
};

export const getContactById = async (contactId) => {
  return Contact.findById(contactId);
};

export const createContact = async (contactData) => {
  return Contact.create(contactData);
};

export const updateContact = async (contactId, updateData) => {
  return Contact.findByIdAndUpdate(contactId, updateData, { new: true });
};

export const deleteContact = async (contactId) => {
  return Contact.findByIdAndDelete(contactId);
};
