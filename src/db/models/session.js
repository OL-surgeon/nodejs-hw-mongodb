import { Schema, model } from 'mongoose';

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users' }, // змінили ref на правильний collection
    accessToken: { type: String, required: true }, // спростили валідацію
    refreshToken: { type: String, required: true },
    accessTokenValidUntil: { type: Date, required: true },
    refreshTokenValidUntil: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const Session = model('sessions', sessionSchema); // залишили твою змінну, змінили collection на 'sessions'
