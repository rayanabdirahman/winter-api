import mongoose from 'mongoose';
import config from '@root/config';
import loggerHelper from '@globals/helpers/logger';
import redisConnection from '@services/redis/redis.connection';
const logger = loggerHelper.create('[setUpDatabase]');

const connectToDbClient = (uri = `${config.DB_URI}`) => {
  const connect = async () => {
    try {
      await mongoose.connect(uri);
      logger.info('[MongoDB] connected successfully ✅');
      redisConnection.connect();
    } catch (error) {
      logger.error(`Failed to connect to database 🛑 : ${error}`);
      return process.exit(1);
    }
  };
  connect();

  mongoose.connection.on('disconnect', connect);
};

export default connectToDbClient;
