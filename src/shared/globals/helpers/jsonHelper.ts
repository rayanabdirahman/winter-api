interface JSONHelper {
  parse(prop: string): unknown;
}

const JSONHelper: JSONHelper = {
  parse(prop: string): unknown {
    try {
      return JSON.parse(prop);
    } catch (error) {
      return prop;
    }
  }
};

export default JSONHelper;
