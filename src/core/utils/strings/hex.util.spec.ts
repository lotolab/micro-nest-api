import {
  decimalToHex,
  hexToDecimalString,
  validBufferHexString,
  validHexString,
} from './hex.util';

describe('HexUtil', () => {
  const hex16 = '0x7b1a5Fc5DeD53aBD';
  const hex3 = '0x12E';
  describe('HexUtil validators', () => {
    test('hex16 is hex', () => {
      const b = validHexString(hex16);
      expect(b).toBe(true);
    });

    test('hex3 is hex', () => {
      const b = validHexString(hex3);
      expect(b).toBe(true);
    });

    test('hex3 not buffer hex', () => {
      const b = validBufferHexString(hex3);
      expect(b).toBe(false);
    });
  });

  describe('HexUtil calc', () => {
    const hex8 = '0x198aBA5Cd7';
    const hex7 = '0x1';
    const dec8 = 109701651671;
    test(`hex8 [${hex8}] to number will equals ${dec8}`, () => {
      const result = hexToDecimalString(hex8);
      expect(result).toEqual(dec8.toString());
    });

    test(`dec8 [${dec8}] to hex will equals hex8 [${hex8}]`, () => {
      const result = decimalToHex(dec8);
      expect(result).toEqual(hex8.toLowerCase());
    });

    test('hex7 to number should throw an error', () => {
      try {
        hexToDecimalString(hex7);
      } catch (error) {
        expect(error.message).toBe(`input hex string ${hex7} invalid.`);
      }
    });
  });
});
