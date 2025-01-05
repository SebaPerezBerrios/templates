import * as Crypto from 'crypto';

export const encryptData = (text: string, secret: Buffer, method = 'aes-256-cbc') => {
  const IV = Crypto.randomBytes(16);

  const cipher = Crypto.createCipheriv(method, secret, IV);

  const encyptedPart = cipher.update(text);
  const encrypted = Buffer.concat([encyptedPart, cipher.final()]);

  return IV.toString('hex') + ':' + encrypted.toString('hex');
};

export const decryptData = (text: string, secret: Buffer, method = 'aes-256-cbc') => {
  const [IVString, encryptedData] = text.split(':');

  const IV = Buffer.from(IVString, 'hex');
  const encryptedText = Buffer.from(encryptedData, 'hex');

  const decipher = Crypto.createDecipheriv(method, secret, IV);

  const decryptedPart = decipher.update(encryptedText);
  const decryptedText = Buffer.concat([decryptedPart, decipher.final()]);

  return decryptedText.toString();
};
