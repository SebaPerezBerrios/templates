import * as bcrypt from 'bcrypt';
import { randomUUID, randomBytes } from 'crypto';

export const uuid = () => randomUUID();

export const randomString = (size: number) => randomBytes(size).toString('base64').slice(0, size);

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, await bcrypt.genSalt());
};

export const comparePasswords = (password: string, hashedPassword: string) => {
  if (!password || !hashedPassword) return Promise.resolve(false);
  return bcrypt.compare(password, hashedPassword);
};
