import { response, Router } from "express";
import { isValidObjectId } from "mongoose";
import { getUserBySessionId, renderPage } from "../functions/index.js";
import { itemsCollection, usersCollection } from "../utils/index.js";

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
        const result = await itemsCollection.findOne({ _id: request.params.productId.toString() });
        if(!result) return response.redirect("/product/search");
        renderPage(request, response, "/product/view", { result });
    } catch(e) {
        console.log(e.stack);
        response.redirect("/");
    }
});

router.post("/action/:actionName/:itemId", async (request, response) => {
    const user = await getUserBySessionId(request.cookies.sessionId);
    if(!user) return response.json({ error: true, message: "You are not logged in" });

    switch(request.params.actionName) {
        case "toggleCart": {
            try {
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
            } catch(e) {
                response.json({ error: true, message: "An error occured" });
                console.log(e.stack);
            }
            break;
        }
        case "toggleFavorite": {
            try {
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
            } catch(e) {
                console.log(e.stack);
            }
        }
    }
});

export default router;