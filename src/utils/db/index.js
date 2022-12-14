import { createConnection } from "mongoose";
import config from "../../config.json" assert { type: "json" }; // experimental feature

export const con = createConnection(config.MONGODB_CONNECT_URI);

con.on("connected", () => console.log("MongoDB: Successfully connected"));
con.on("error", () => {
    console.log("MongoDB: Connection error");
    process.exit();
});