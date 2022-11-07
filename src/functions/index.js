import { sessionsCollection, usersCollection } from "../utils/index.js";

export function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function renderPage(request, response, page, options = {}) {
    try {
        response.render("index", { page, options, user: await getUserBySessionId(request.cookies.sessionId) });
        await sessionsCollection.updateOne({ sessionId: request.cookies.sessionId }, { $set: { lastSeen: Date.now() } });
    } catch(e) {
        console.log(e.stack);
        response.redirect("/");
    }
}

export function generateRandomSessionId(length = 24) {
    const generateFrom = "1234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm";
    let generatedSessionId = "";
    for(let i = 0; i < (length > generateFrom.length ? generateFrom.length : length); i++) {
        generatedSessionId += `${generateFrom[Math.floor(Math.random() * generateFrom.length)]}`;
    }
    return generatedSessionId;
}

export async function getUserBySessionId(sessionId) {
    return new Promise(async(resolve) => {
        const result = await sessionsCollection.findOne({ sessionId });
        if(result && typeof(sessionId) !== "undefined") {
            resolve(await usersCollection.findOne({ _id: result.userId }));
        } else {
            resolve(null);
        }
    });
}