import { Schema, model } from 'mongoose';

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    accessToken: { type: String, required: [true, 'Access token is required'] },
    refreshToken: {
      type: String,
      required: [true, 'Refresh token is required'],
    },
    accessTokenValidUntil: {
      type: Date,
      required: [true, 'Access token validity date is required'],
    },
    refreshTokenValidUntil: {
      type: Date,
      required: [true, 'Refresh token validity date is required'],
    },
  },
  { timestamps: true, versionKey: false },
);

export const Session = model('Session', sessionSchema);
