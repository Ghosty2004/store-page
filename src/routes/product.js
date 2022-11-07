import { response, Router } from "express";
import { getUserBySessionId, renderPage } from "../functions/index.js";
import { itemsCollection, reviewsCollection, usersCollection } from "../utils/index.js";

const router = Router();

router.get("/search", async (request, params) => {
    try {
        const { query } = request.query;
        const startTime = Date.now();
        const result = await itemsCollection.find({ name: new RegExp(encodeURIComponent(query), "i") });
        const endTime = Date.now();
        const timeTook = endTime - startTime;
        renderPage(request, params, "/product/search", { result, query, timeTook });
    } catch(e) {
        console.log(e.stack);
        response.redirect("/");
    }
});

router.get("/view/:productId", async (request, response) => {
    try {
        const result = { 
            ...await itemsCollection.findOne({ _id: request.params.productId }),
            ...{ reviews: await reviewsCollection.find({ itemId: request.params.productId })}
        };
        renderPage(request, response, "/product/view", { result });
    } catch(e) {
        console.log(e.stack);
        response.redirect("/");
    }
});


router.put("/action/addToCart/:productId", async (request, response) => {
    const user = await getUserBySessionId(request.cookies.sessionId);
    if(!user) return response.json({ error: true, message: "You are not logged in" });
    const { itemsInCart } = user;
    if(!itemsInCart.some(s => s === request.params.productId)) itemsInCart.push(request.params.productId);
    await usersCollection.updateOne({ _id: user._id }, { $set: { itemsInCart } });
    response.json({ error: false });
});

router.delete("/action/removeFromCart/:productId", async (request, response) => {
    const user = await getUserBySessionId(request.cookies.sessionId);
    if(!user) return response.json({ error: true, message: "You are not logged in" });
    const { itemsInCart } = user;
    const index = itemsInCart.findIndex(f => f === request.params.productId);
    if(index !== -1) itemsInCart.splice(index, 1);
    await usersCollection.updateOne({ _id: user._id }, { $set: { itemsInCart } });
    response.json({ error: false });
});

router.put("/action/addToFavorite/:productId", async (request, response) => {
    const user = await getUserBySessionId(request.cookies.sessionId);
    if(!user) return response.json({ error: true, message: "You are not logged in" });
    const { itemsInFavorites } = user;
    if(!itemsInFavorites.some(s => s === request.params.productId)) itemsInFavorites.push(request.params.productId);
    await usersCollection.updateOne({ _id: user._id }, { $set: { itemsInFavorites } });
    response.json({ error: false });
});

router.delete("/action/removeFromFavorite/:productId", async (request, response) => {
    const user = await getUserBySessionId(request.cookies.sessionId);
    if(!user) return response.json({ error: true, message: "You are not logged in" });
    const { itemsInFavorites } = user;
    const index = itemsInFavorites.findIndex(f => f === request.params.productId);
    if(index !== -1) itemsInFavorites.splice(index, 1);
    await usersCollection.updateOne({ _id: user._id }, { $set: { itemsInFavorites } });
    response.json({ error: false });
});

export default router;