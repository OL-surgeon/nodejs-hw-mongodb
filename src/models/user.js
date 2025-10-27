import { model, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true }, // залишили твою назву
    email: { type: String, required: true, unique: true }, // спростили валідацію
    password: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; // залишили видалення пароля
  return obj;
};

export const User = model('users', userSchema); // залишили твою назву, змінили collection на правильний
