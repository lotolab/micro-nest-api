import { AESCipher, AES_KEY_LENGTH, genRandomAppKey } from './aes-utils';

describe('AES-Utils', () => {
  const text = '18811264567';
  const appkey = 'iBOrlZ6A5Mpy2V2lYqo1CD65Ux5KPCWb';
  const encodeBaseText = 'iOSngPTREicABv2eQBR7KA==';
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

      // globalThis.console.log(aes.opts, base64);

      const decrypedText = aes.decode(AESCipher.fromBase64ToHex(base64));

      expect(decrypedText).toEqual(text);
    });

    test(`encode ${text} will to be ${encodeBaseText}`, () => {
      const aes = new AESCipher(appkey);
      const encrypted = AESCipher.hexToBase64(aes.encode(text));

      expect(encrypted).toEqual(encodeBaseText);
    });
  });
});
