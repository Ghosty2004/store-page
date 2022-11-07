const addToCart = (itemId) => {
    fetch(`/product/action/addToCart/${itemId}`, {
        method: "PUT"
    }).then(async(response) => {
        const json = await response.json();
        if(!json.error) window.location.reload();
    }).catch(console.error);
};

const removeFromCart = (itemId) => {
    fetch(`/product/action/removeFromCart/${itemId}`, {
        method: "DELETE"
    }).then(async(response) => {
        const json = await response.json();
        if(!json.error) window.location.reload();
    }).catch(console.error);
};

const addToFavorite = (itemId) => {
    fetch(`/product/action/addToFavorite/${itemId}`, {
        method: "PUT"
    }).then(async(response) => {
        const json = await response.json();
        if(!json.error) window.location.reload();
    }).catch(console.error);
};

const removeFromFavorite = (itemId) => {
    fetch(`/product/action/removeFromFavorite/${itemId}`, {
        method: "DELETE"
    }).then(async(response) => {
        const json = await response.json();
        if(!json.error) window.location.reload();
    }).catch(console.error);
};