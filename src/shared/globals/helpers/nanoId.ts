import * as nanoid from 'nanoid';

interface NanoIdHelper {
  generateInt(): string;
}

const nanoIdHelper: NanoIdHelper = {
  generateInt(): string {
    const alphabet = '0123456789';
    const generator = nanoid.customAlphabet(alphabet, 12);
    return generator();
  }
};

export default nanoIdHelper;
