import crypto from 'crypto';

/**
 * Generates a unique MD5 ID for conversations
 * @returns MD5 hash string
 */
export const generateMd5Id = (): string => {
  const timestamp = Date.now().toString();
  const randomNumber = Math.floor(Math.random() * 100001).toString();
  const uniqueString = timestamp + randomNumber;
  
  return crypto
    .createHash('md5')
    .update(uniqueString)
    .digest('hex');
};
