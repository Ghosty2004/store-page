import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { getUserBySessionId, renderPage } from "../functions/index.js";
import { categories, itemsCollection } from "../utils/index.js";

const router = Router();

router.get("/", async (request, response) => {
    const user = await getUserBySessionId(request.cookies.sessionId);
    if(!user || !user.isAdmin) return response.redirect("/");
    renderPage(request, response, "admincp");
});

router.get("/fetch-categories", (request, response) => {
    response.json(Object.fromEntries(Object.entries(categories).filter((_, index) => index !== 0).map(m => [m[1], m[0]])));
});

router.put("/add-item", async (request, response) => {
    const user = await getUserBySessionId(request.cookies.sessionId);
    if(!user) return response.json({ error: true, message: "You are not logged in!" });
    if(!user.isAdmin) return response.json({ error: true, message: "You are not an admin!" });
    const { itemName, itemDescription, itemCategory, itemPrice, itemStock, itemImages } = request.body;
    new itemsCollection({ 
        name: itemName,
        description: itemDescription,
        categoryType: itemCategory,
        price: itemPrice,
        stock: itemStock,
        images: itemImages
    }).save().then(() => {
        response.json({ error: false, message: "Item added successfully!" });
    }).catch(() => {
        response.json({ error: true, message: "An error occurred while adding the item!" });
    });
});

router.delete("/remove-item", async (request, response) => {
    const user = await getUserBySessionId(request.cookies.sessionId);
    if(!user) return response.json({ error: true, message: "You are not logged in!" });
    if(!user.isAdmin) return response.json({ error: true, message: "You are not an admin!" });
    const { itemId } = request.body;
    try {
        if(!isValidObjectId(itemId)) return response.json({ error: true, message: "Invalid item ID format!" });
        if(await itemsCollection.exists({ _id: itemId })) {
            await itemsCollection.deleteOne({ _id: itemId });
            response.json({ error: false, message: "Item removed successfully!" });
        } else {
            response.json({ error: true, message: "Item not found!" });
        }
    } catch(e) {
        console.log(e.stack);
        response.json({ error: true, message: "An error occurred while removing the item!" });
    }
});

export default router;