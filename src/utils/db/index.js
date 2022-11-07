import { createConnection } from "mongoose";
import config from "../../config.json" assert { type: "json" };

export const con = createConnection(config.MONGODB_CONNECT_URI);

con.on("connect", () => console.log("MongoDB: Successfully connected"));