import { con, userSchema, sessionSchema, categoriesSchema, itemsSchema, reviewSchema } from "../index.js";

export const usersCollection = con.model("users", userSchema);
export const sessionsCollection = con.model("sessions", sessionSchema);
export const categoriesCollection = con.model("categories", categoriesSchema);
export const itemsCollection = con.model("items", itemsSchema);
export const reviewsCollection = con.model("reviews", reviewSchema);