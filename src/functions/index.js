import { sessionsCollection, usersCollection, categories } from "../utils/index.js";

export async function renderPage(request, response, page, options = {}) {
    try {
        const user = await getUserBySessionId(request.cookies.sessionId)
        response.render("index", { page, options, user, categories });
        if(!user) return;
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

export function isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
}