import mongoose from "mongoose";
import config from "./config";

const MONGO_URI = `${config.DB_URI}`;

const connectToDbClient = (uri: string = `${config.DB_URI}`) => {
  const connect = async () => {
    try {
      await mongoose.connect(uri);
      console.info(`Successfully connected to database ✅`);
    } catch (error) {
      console.error(`Failed to connect to database 🛑 : ${error}`);
      return process.exit(1);
    }
  };
  connect();

  mongoose.connection.on("disconnect", connect);
};

export default connectToDbClient;
