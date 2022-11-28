import Logger from "bunyan";
import bunyan from "bunyan";

interface ILoggerHelper {
  create(name: string): Logger;
}

const loggerHelper: ILoggerHelper = {
  create(name: string): Logger {
    return bunyan.createLogger({
      name: name,
      level: "debug",
    });
  },
};

export default loggerHelper;
