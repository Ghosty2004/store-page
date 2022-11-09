import { Router } from "express";

import { generateRandomSessionId, getUserBySessionId, renderPage } from "../functions/index.js";
import { sessionsCollection, usersCollection } from "../utils/index.js";

const router = Router();

router.get("/me", async (request, response) => {
    if(!await getUserBySessionId(request.cookies.sessionId)) return response.redirect("/");
    renderPage(request, response, "user/me");
});

router.get("/login", async (request, response) => {
    if(await getUserBySessionId(request.cookies.sessionId)) return response.redirect("/");
    renderPage(request, response, "user/login");
});

router.get("/register", async (request, response) => {
    if(await getUserBySessionId(request.cookies.sessionId)) return response.redirect("/");
    renderPage(request, response, "user/register");
});

router.get("/signout", async (request, response) => {
    if(!await getUserBySessionId(request.cookies.sessionId)) return response.redirect("/");
    sessionsCollection.deleteOne({ sessionId: request.cookies.sessionId });
    response.clearCookie("sessionId").redirect("/");
});

router.post("/login", async (request, response) => {
    try {
        const result = await usersCollection.findOne({ userName: request.body.username, password: request.body.password });
        if(!result) return response.json({ error: true, message: "Invalid user name or password!" });
        const sessionId = generateRandomSessionId();
        new sessionsCollection({ userId: result._id, sessionId, lastSeen: Date.now() }).save();
        response.cookie("sessionId", sessionId, { maxAge: ((1000 * 60) * 60) * 24 }).redirect("/user/me");
    } catch(e) {
        console.error(e.stack);
        response.status(500);
    }
});

router.post("/register", async (request, response) => {
    try {
        if(await usersCollection.exists({ userName: request.body.username })) return response.send({ error: true, message: "This username is already exists!" });
        if(await usersCollection.exists({ email: request.body.email })) return response.send({ error: true, message: "This email address already registered!" });
        if(request.body.password !== request.body.retypePassword) return response.send({ error: true, message: "Passwords does not match!" });
        const user = new usersCollection({
            userName: request.body.username,
            password: request.body.password,
            email: request.body.email,
            joinDate: Date.now()
        });
        await user.save();
        const sessionId = generateRandomSessionId();
        new sessionsCollection({ userId: user._id, sessionId, lastSeen: Date.now() }).save();
        response.cookie("sessionId", sessionId, { maxAge: ((1000 * 60) * 60) * 24 }).redirect("/user/me");
    } catch(e) {
        console.error(e.stack);
        response.status(500);
    }
});

export default router;