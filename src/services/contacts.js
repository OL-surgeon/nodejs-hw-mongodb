import { Contact } from '../models/contact.js';

export const getAllContacts = async ({
  userId,
  page,
  perPage,
  sortBy,
  sortOrder,
  type,
  isFavourite,
}) => {
  const skip = (page - 1) * perPage;

  const filter = { userId };

  if (type) {
    filter.contactType = type;
  }

  if (isFavourite !== undefined) {
    filter.isFavourite = isFavourite === 'true';
  }

  const totalItems = await Contact.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / perPage);

  const sortField = sortBy || 'name';
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  const contacts = await Contact.find(filter)
    .sort({ [sortField]: sortDirection })
    .skip(skip)
    .limit(perPage);

  return { contacts, totalItems, totalPages };
};

export const getContactById = async (contactId, userId) => {
  return Contact.findOne({ _id: contactId, userId });
};

export const createContact = async (contactData, userId) => {
  return Contact.create({ ...contactData, userId });
};

export const updateContact = async (contactId, updateData, userId) => {
  return Contact.findOneAndUpdate({ _id: contactId, userId }, updateData, {
    new: true,
  });
};

export const deleteContact = async (contactId, userId) => {
  return Contact.findOneAndDelete({ _id: contactId, userId });
};
