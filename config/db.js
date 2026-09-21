import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "mysql",
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    })
  : new Sequelize(
      process.env.DB_NAME || "smart_logistics",
      process.env.DB_USER || "root",
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        logging: false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL Connected: ${sequelize.config.host}`);
    if (process.env.DB_SYNC === "true") {
      await sequelize.sync({ alter: true });
      console.log("Database synced");
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;
