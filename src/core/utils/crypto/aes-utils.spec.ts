import { AESCipher, AES_KEY_LENGTH, genRandomAppKey } from './aes-utils';

describe('AES-Utils', () => {
  const text = '18811264567';
  const appkey = '';
  describe('get random key', () => {
    test('Test random key length', () => {
      const key = genRandomAppKey();

      const buf = AESCipher.fromBase64(key);

      expect(buf.byteLength).toBeGreaterThanOrEqual(AES_KEY_LENGTH);
    });

    test('encrypted aes hex', () => {
      const aes = new AESCipher(appkey);
      const enData = aes.encode(text);
      const decrypedText = aes.decode(enData);
      expect(decrypedText).toEqual(text);
    });

    test('encrypted aes base64', () => {
      const aes = new AESCipher(appkey);

      // globalThis.console.log(aes.opts);

      const enData = aes.encode(text);
      const base64 = AESCipher.hexToBase64(enData);

      const decrypedText = aes.decode(AESCipher.fromBase64ToHex(base64));

      expect(decrypedText).toEqual(text);
    });
  });
});
