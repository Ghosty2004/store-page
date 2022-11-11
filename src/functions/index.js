import { sessionsCollection, usersCollection, categories, itemsCollection } from "../utils/index.js";

export async function renderPage(request, response, page, options = {}) {
    try {
        const user = await getUserBySessionId(request.cookies.sessionId);
        const items = await itemsCollection.find({});
        response.render("index", { 
            page, 
            options, 
            user, 
            items,
            categories
        });
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

export function getUserBySessionId(sessionId) {
    return new Promise(async(resolve) => {
        try {
            const result = await sessionsCollection.findOne({ sessionId });
            if(result && typeof(sessionId) !== "undefined") {
                resolve(await usersCollection.findOne({ _id: result.userId }));
            } else {
                resolve(null);
            }
        } catch(e) {
            console.log(e.stack);
            resolve(null);
        }
    });
}

export function getUserNameByUserId(userId) {
    return new Promise(async(resolve) => {
        try {
            const result = await usersCollection.findOne({ _id: userId });
            if(result) {
                resolve(result.userName);
            } else {
                resolve(null);
            }
        } catch(e) {
            console.log(e.stack);
            resolve(null);
        }
    });
}

export function isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
}