import mongoose from "mongoose";
import config from "./config";
import loggerHelper from "./shared/globals/helpers/logger";
const logger = loggerHelper.create("[setUpDatabase]");

const connectToDbClient = (uri: string = `${config.DB_URI}`) => {
  const connect = async () => {
    try {
      await mongoose.connect(uri);
      logger.info(`Successfully connected to database ✅`);
    } catch (error) {
      logger.error(`Failed to connect to database 🛑 : ${error}`);
      return process.exit(1);
    }
  };
  connect();

  mongoose.connection.on("disconnect", connect);
};

export default connectToDbClient;
