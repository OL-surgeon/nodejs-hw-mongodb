import Joi from 'joi';

export const addContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  phoneNumber: Joi.string().min(3).max(20).required(),
  contactType: Joi.string().valid('work', 'home', 'personal').required(),
  email: Joi.string().email().min(3).max(30),
  isFavourite: Joi.boolean(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  phoneNumber: Joi.string().min(3).max(20),
  contactType: Joi.string().valid('work', 'home', 'personal'),
  email: Joi.string().email().min(3).max(30),
  isFavourite: Joi.boolean(),
}).min(1);
