import mongoose from "mongoose";

const connectDB = async () => {
  const url = process.env.MONGO_URI;

  if (!url) throw new Error("MONGO_URI not defined");

  try {
    await mongoose.connect(url, {
      dbName: "Chatappmicroserviceapp",
    });
    console.log("connected to db");
  } catch (error) {
    console.error("failed to connect to db", error);
    process.exit(1);
  }
};

export default connectDB;
