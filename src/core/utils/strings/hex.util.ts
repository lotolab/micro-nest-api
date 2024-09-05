export function validHexString(hex: string): boolean {
  if (!hex?.length) return false;
  return /^(0x)?[0-9a-fA-F]{1,}$/.test(hex);
}

export function validBufferHexString(hex: string): boolean {
  if (!hex?.length) return false;
  return /^(0x)?[0-9a-fA-F]{1,}$/.test(hex) && hex.length % 2 === 0;
}

export function hexToDecimalString(hex: string): string {
  // if (!validHexString(hex)) throw new Error(`input hex string ${hex} invalid.`);

  // const s = '0123456789ABCDEF';
  // const _hex = hex.startsWith('0x')
  //   ? hex.substring(2).toUpperCase()
  //   : hex.toUpperCase();

  // let dec: number = 0;
  // for (let i = 0; i < _hex.length; i++) {
  //   dec += s.indexOf(_hex.charAt(i)) * Math.pow(16, _hex.length - i - 1);
  // }

  // return dec.toString();

  if (!validHexString(hex)) throw new Error(`input hex string ${hex} invalid.`);
  const _hex = hex.startsWith('0x') ? hex : `0x${hex}`;

  return Number(_hex).toString(10);
}

export function hex2Dec(hex: string) {
  if (!validHexString(hex)) throw new Error(`input hex string ${hex} invalid.`);
  const _hex = hex.startsWith('0x') ? hex : `0x${hex}`;

  return Number(_hex).toString(10);
}

export function decimalToHex(dec: number | string): string {
  if (!/^[\d]+$/.test(dec.toString())) throw new Error(`num [${dec}] invalid.`);

  const num: number = typeof dec === 'number' ? dec : Number(dec).valueOf();
  // const s = [
  //   '0',
  //   '1',
  //   '2',
  //   '3',
  //   '4',
  //   '5',
  //   '6',
  //   '7',
  //   '8',
  //   '9',
  //   'A',
  //   'B',
  //   'C',
  //   'D',
  //   'E',
  //   'F',
  // ];

  const remainSequence = [];
  let remainder = num % 16;
  let quitient = Math.floor(num / 16);
  remainSequence.push(remainder);

  do {
    remainder = quitient % 16;
    quitient = Math.floor(quitient / 16);

    remainSequence.push(remainder);
  } while (quitient > 0);

  return `0x${remainSequence
    .reverse()
    .map((v) => v.toString(16))
    .join('')}`;
}
