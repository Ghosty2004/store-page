import { Router } from "express";
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
    const { itemName, itemDescription, itemCategory, itemPrice, itemStock } = request.body;
    new itemsCollection({ 
        name: itemName,
        description: itemDescription,
        category: itemCategory,
        price: itemPrice,
        stock: itemStock
    }).save().then(() => {
        response.json({ error: false, message: "Item added successfully!" });
    }).catch(() => {
        response.json({ error: true, message: "An error occurred while adding the item!" });
    });
});

export default router;