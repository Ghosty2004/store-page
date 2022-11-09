import { Router } from "express";
import { getUserBySessionId, renderPage } from "../functions/index.js";

const router = Router();

router.get("/", async (request, response) => {
    const user = await getUserBySessionId(request.cookies.sessionId);
    if(!user || !user.isAdmin) return response.redirect("/");
    renderPage(request, response, "admincp");
});

export default router;