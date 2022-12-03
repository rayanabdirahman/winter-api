interface TextTransformHelper {
  capitaliseFirstLetter(string: string): string;
  toLowerCase(string: string): string;
}

const textTransformHelper: TextTransformHelper = {
  capitaliseFirstLetter(string: string): string {
    const text = string.toLowerCase();
    return text
      .split(' ')
      .map((value) => `${value.charAt(0).toUpperCase()} ${value.slice(1).toLowerCase()}`)
      .join('');
  },
  toLowerCase(string: string): string {
    return string.toLowerCase();
  }
};

export default textTransformHelper;
