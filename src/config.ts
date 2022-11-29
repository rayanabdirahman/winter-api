import dotenv from 'dotenv';
dotenv.config({});
import cloudinary from 'cloudinary';

interface IConfig {
  validate(): void;
  cloudinary(): void;
}

class Config implements IConfig {
  public PORT: string | undefined;
  public API_URL: string | undefined;
  public DB_URI: string | undefined;
  public JWT_TOKEN: string | undefined;
  public NODE_ENV: string | undefined;
  public COOKIE_SESSION_NAME: string | undefined;
  public COOKIE_SESSION_KEY_ONE: string | undefined;
  public COOKIE_SESSION_KEY_TWO: string | undefined;
  public CLIENT_URL: string | undefined;
  public REDIS_HOST: string | undefined;
  public CLOUDINARY_CLOUD_NAME: string | undefined;
  public CLOUDINARY_API_KEY: string | undefined;
  public CLOUDINARY_API_SECRET: string | undefined;

  private readonly DEFAULT_API_URL = 'api/v1';
  private readonly DEFAULT_DB_URI = 'mongodb://127.0.0.1:27017/winter';

  constructor() {
    this.PORT = process.env.PORT || '5000';
    this.API_URL = process.env.API_URL || this.DEFAULT_API_URL;
    this.DB_URI = process.env.DB_URI || this.DEFAULT_DB_URI;
    this.JWT_TOKEN = process.env.JWT_TOKEN || '';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.COOKIE_SESSION_NAME = process.env.COOKIE_SESSION_NAME || '';
    this.COOKIE_SESSION_KEY_ONE = process.env.COOKIE_SESSION_KEY_ONE || '';
    this.COOKIE_SESSION_KEY_TWO = process.env.COOKIE_SESSION_KEY_TWO || '';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.REDIS_HOST = process.env.REDIS_HOST || '';
    this.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
    this.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
    this.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
  }

  validate(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined`);
      }
    }
  }

  cloudinary(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUDINARY_CLOUD_NAME,
      api_key: this.CLOUDINARY_API_KEY,
      api_secret: this.CLOUDINARY_API_SECRET
    });
  }
}

const config: Config = new Config();
export default config;
