import { Types } from 'mongoose';

export type PlainDocument<T extends object> = {
  _id: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
} & T;
