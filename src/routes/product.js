import { response, Router } from "express";
import { isValidObjectId } from "mongoose";
import { getUserBySessionId, getUserNameByUserId, renderPage } from "../functions/index.js";
import { con, itemsCollection, usersCollection } from "../utils/index.js";

const router = Router();

router.get("/search", async (request, params) => {
    try {
        let { query, category } = request.query;
        if(!query) query = "";
        if(!category) category = "0";
        const startTime = Date.now();
        const result = await itemsCollection.find({ name: new RegExp(encodeURIComponent(query), "i"), ...Number(category) ? { categoryType: Number(category) } : {} });
        const endTime = Date.now();
        const timeTook = endTime - startTime;
        renderPage(request, params, "/product/search", { result, query, category, timeTook });
    } catch(e) {
        console.log(e.stack);
        response.redirect("/");
    }
});

router.get("/view/:productId", async (request, response) => {
    try {
        if(!isValidObjectId(request.params.productId)) return response.redirect("/product/search");
        let result = await itemsCollection.findOne({ _id: request.params.productId.toString() });
        if(!result) return response.redirect("/product/search");
        renderPage(request, response, "/product/view", { result });
    } catch(e) {
        console.log(e.stack);
        response.redirect("/");
    }
});

router.post("/action/:actionName/:itemId", async (request, response) => {
    try {
        const user = await getUserBySessionId(request.cookies.sessionId);
        if(!user) return response.json({ error: true, message: "You are not logged in" });
        switch(request.params.actionName) {
            case "toggleCart": {
                const { itemsInCart } = user;
                let responseJson = {};
                if(itemsInCart.includes(request.params.itemId)) {
                    itemsInCart.splice(itemsInCart.indexOf(request.params.itemId), 1);
                    responseJson = { error: false, message: "Item removed from cart", type: "remove" };
                } else {
                    itemsInCart.push(request.params.itemId);
                    responseJson = { error: false, message: "Item added to cart", type: "add" };
                }
                await usersCollection.updateOne({ _id: user._id }, { $set: { itemsInCart } });
                return response.json(responseJson);
            }
            case "toggleFavorite": {
                const { itemsInFavorites } = user;
                let responseJson = {};
                if(itemsInFavorites.includes(request.params.itemId)) {
                    itemsInFavorites.splice(itemsInFavorites.indexOf(request.params.itemId), 1);
                    responseJson = { error: false, message: "Item removed from favorites", type: "remove" };
                } else {
                    itemsInFavorites.push(request.params.itemId);
                    responseJson = { error: false, message: "Item added to favorites", type: "add" };
                }
                await usersCollection.updateOne({ _id: user._id }, { $set: { itemsInFavorites } });
                return response.json(responseJson);
            }
        }
    } catch(e) {
        response.json({ error: true, message: "An error occured" });
        console.log(e.stack);
    }
});

router.post("/add-review/:itemId", async (request, response) => {
    try {
        const user = await getUserBySessionId(request.cookies.sessionId);
        if(!user) return response.json({ error: true, message: "You are not logged in" });
        const { rating, text } = request.body;
        if(typeof(rating) === "undefined" || typeof(text) === "undefined") return response.json({ error: true, message: "Please fill all the fields" });
        const { reviews } = await itemsCollection.findOne({ _id: request.params.itemId });
        if(reviews.some(s => s.userId.toString() == user._id)) return;
        reviews.push({
            userId: user._id,
            rating: Number(rating),
            text,
            date: Date.now()
        });
        await itemsCollection.updateOne({ _id: request.params.itemId }, { $set: { reviews } });
    } catch(e) {
        console.log(e.stack);
    } finally {
        if(response.headersSent) return;
        response.redirect(`/product/view/${request.params.itemId}`);
    }
});

router.delete("/delete-review", async (request, response) => {
    try {
        const user = await getUserBySessionId(request.cookies.sessionId);
        if(!user) return response.json({ error: true, message: "You are not logged in" });
        const { itemId, userId } = request.body;
        if(typeof(itemId) === "undefined" || typeof(userId) === "undefined") return response.json({ error: true, message: "itemId or userId property missing!" });
        if(userId != user._id && !user.isAdmin) return response.json({ error: true, message: "You don't have permission for this action!" });
        const { reviews } = await itemsCollection.findOne({ _id: itemId });
        const index = reviews.findIndex(f => f.userId == userId);
        if(index === -1) return response.json({ error: true, message: "No reviews found from this userId and itemId!" });
        reviews.splice(index, 1);
        await itemsCollection.updateOne({ _id: itemId }, { $set: { reviews } });
        response.json({ error: false });
    } catch(e) {
        console.log(e.stack);
        response.json({ error: true, message: "An error occured" });
    }
});

export default router;