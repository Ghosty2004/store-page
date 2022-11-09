import { con, userSchema, sessionSchema, itemsSchema } from "../index.js";

export const usersCollection = con.model("users", userSchema);
export const sessionsCollection = con.model("sessions", sessionSchema);
export const itemsCollection = con.model("items", itemsSchema);