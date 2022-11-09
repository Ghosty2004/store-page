import { Schema } from "mongoose";

export const userSchema = new Schema({
    userName: Schema.Types.String,
    password: Schema.Types.String,
    email: Schema.Types.String,
    joinDate: Schema.Types.Number,
    itemsInCart: [Schema.Types.String],
    itemsInFavorites: [Schema.Types.String],
    isAdmin: Schema.Types.Boolean,
});

export const sessionSchema = new Schema({
    userId: Schema.Types.ObjectId,
    sessionId: Schema.Types.String,
    lastSeen: Schema.Types.Number
});

export const itemsSchema = new Schema({
    name: Schema.Types.String,
    description: Schema.Types.String,
    categoryType: Schema.Types.Number,
    price: Schema.Types.Number,
    stock: Schema.Types.Number,
    images: [Schema.Types.String],
    reviews: [
        {
            userId: Schema.Types.ObjectId,
            rating: Schema.Types.Number,
            text: Schema.Types.String,
            date: Schema.Types.Number
        }
    ]
});