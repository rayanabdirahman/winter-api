/* eslint-disable @typescript-eslint/no-explicit-any */
interface JSONHelper {
  parse(prop: string): any;
}

const JSONHelper: JSONHelper = {
  parse(prop: string): any {
    try {
      return JSON.parse(prop);
    } catch (error) {
      return prop;
    }
  }
};

export default JSONHelper;
