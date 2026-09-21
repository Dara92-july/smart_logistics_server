import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

const databaseUrl = process.env.DATABASE_URL;
console.log("DATABASE_URL host:", databaseUrl ? new URL(databaseUrl.replace("postgresql://", "http://")).hostname : "not set");

let sequelize;

  if (databaseUrl) {
  const url = databaseUrl.startsWith("postgres://")
    ? databaseUrl.replace("postgres://", "postgresql://")
    : databaseUrl;
  sequelize = new Sequelize(url, {
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: false, rejectUnauthorized: false },
    },
    logging: console.log,
    pool: { max: 10, min: 0, acquire: 60000, idle: 10000 },
  });
} else {
  sequelize = new Sequelize(
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
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    if (process.env.DB_SYNC === "true") {
      await sequelize.sync({ alter: true });
      console.log("Database synced");
    }
  } catch (error) {
    console.error("Database connection failed:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
};

export { sequelize };
export default connectDB;
