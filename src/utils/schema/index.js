import { Schema } from "mongoose";

export const userSchema = new Schema({
    userName: Schema.Types.String,
    password: Schema.Types.String,
    email: Schema.Types.String,
    joinDate: Schema.Types.Number,
    itemsInCart: [Schema.Types.String],
    itemsInFavorites: [Schema.Types.String]
});

export const sessionSchema = new Schema({
    userId: Schema.Types.ObjectId,
    sessionId: Schema.Types.String,
    lastSeen: Schema.Types.Number
});

export const categoriesSchema = new Schema({
    name: Schema.Types.String,
    icon: Schema.Types.String
});

export const itemsSchema = new Schema({
    name: Schema.Types.String,
    description: Schema.Types.String,
    price: Schema.Types.Number,
    stock: Schema.Types.Number,
    images: Schema.Types.Array
});

export const reviewSchema = new Schema({
    userId: Schema.Types.ObjectId,
    itemId: Schema.Types.ObjectId,
    content: Schema.Types.String,
    stars: Schema.Types.Number,
    date: Schema.Types.Number
});