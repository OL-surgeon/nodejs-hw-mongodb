import { model, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: [true, 'Name is required'] },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    password: { type: String, required: [true, 'Password is required'] },
  },
  { timestamps: true, versionKey: false },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; // прибираємо пароль
  return obj;
};

export const User = model('User', userSchema);
