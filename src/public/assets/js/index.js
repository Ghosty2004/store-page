// => Toastify init
const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer)
      toast.addEventListener("mouseleave", Swal.resumeTimer)
    }
});

// => Varibles declaration
const categorySelect = document.querySelector(".category-select>select[name=\"category\"]");
const searchBox = document.querySelector(".search-box>input[type=\"text\"]");

// => Backend calls
const productToggleCart = (itemId, element = null) => {
    const div = element ? element.querySelector("div") : null;
    fetch(`/product/action/toggleCart/${itemId}`, { 
        method: "POST"
    }).then((response) => {
        response.json().then(json => {
            if(div) {
                Toast.fire({
                    icon: !json.error ? "success" : "error",
                    title: json.message
                });
                if(json.error) return;
                div.className = json.type === "add" ? "remove-from-cart" : "add-to-cart";
            } else {
                window.location.reload();
            }
        }).catch(console.error);
    }).catch(console.error);
};

const productToggleFavorite = (itemId, element = null) => {
    const div = element ? element.querySelector("div") : null;
    fetch(`/product/action/toggleFavorite/${itemId}`, { 
        method: "POST" 
    }).then((response) => {
        response.json().then(json => {
            if(div) {
                Toast.fire({
                    icon: !json.error ? "success" : "error",
                    title: json.message
                });
                if(json.error) return;
                div.className = json.type === "add" ? "remove-from-favorite" : "add-to-favorite";
            } else {
                window.location.reload();
            }
        }).catch(console.error)
    }).catch(console.error);
};
const getValidItemCategories = () => new Promise(resolve => fetch("/admincp/fetch-categories").then(response => response.json().then(json => resolve(json)).catch(console.error)).catch(console.error));

// => AdminCP functions
const showItemAdd_AdminCP = async (type, values = {}) => {
    const title = "Add new item";
    const footer = `Step: ${type + 1} / 7`;
    switch(type) {
        case 0: {
            Swal.fire({
                title,
                input: 'text',
                inputLabel: 'Item name',
                confirmButtonText: 'Next',
                footer,
                inputValidator: (result) => !result && 'Please input the item name!'
            }).then((result) => { 
                if(!result.isConfirmed || result.isDismissed) return Swal.fire({ icon: "warning", title: "Canceled" })
                values = { ...values, itemName: result.value }; 
                showItemAdd_AdminCP(1, values); 
            });
            break;
        }
        case 1: {
            Swal.fire({
                title,
                input: 'textarea',
                inputLabel: 'Item description',
                confirmButtonText: 'Next',
                footer,
                inputValidator: (result) => !result && 'Please input the item description!'
            }).then((result) => {
                if(!result.isConfirmed || result.isDismissed) return Swal.fire({ icon: "warning", title: "Canceled" })
                values = { ...values, itemDescription: result.value };
                showItemAdd_AdminCP(2, values);
            });
            break;
        }
        case 2: {
            const inputOptions = await getValidItemCategories();
            Swal.fire({
                title,
                input: 'select',
                inputOptions,
                inputLabel: 'Item category',
                confirmButtonText: 'Next',
                footer,
                inputValidator: (result) => !result && 'Please select the item category!'
            }).then((result) => {
                if(!result.isConfirmed || result.isDismissed) return Swal.fire({ icon: "warning", title: "Canceled" })
                values = { ...values, itemCategory: result.value };
                showItemAdd_AdminCP(3, values);
            });
            break;
        }
        case 3: {
            Swal.fire({
                title,
                input: 'number',
                inputLabel: 'Item price',
                confirmButtonText: 'Next',
                footer,
                inputValidator: (result) => !result && 'Please input the item price!'
            }).then((result) => {
                if(!result.isConfirmed || result.isDismissed) return Swal.fire({ icon: "warning", title: "Canceled" })
                values = { ...values, itemPrice: result.value };
                showItemAdd_AdminCP(4, values);
            });
            break;
        }
        case 4: {
            Swal.fire({
                title,
                input: 'number',
                inputLabel: 'Item stock',
                confirmButtonText: 'Next',
                footer,
                inputValidator: (result) => !result && 'Please input the item stock!'
            }).then((result) => {
                if(!result.isConfirmed || result.isDismissed) return Swal.fire({ icon: "warning", title: "Canceled" })
                values = { ...values, itemStock: result.value };
                showItemAdd_AdminCP(5, values);
            });
            break;
        }
        case 5: {
            Swal.fire({
                title,
                input: 'file',
                inputAttributes: {
                    'accept': 'image/png, image/jpeg'
                },
                inputLabel: 'Item image',
                confirmButtonText: 'Next',
                footer,
                inputValidator: (result) => !result && 'Please input the item image!'
            }).then((result) => {
                if(!result.isConfirmed || result.isDismissed) return Swal.fire({ icon: "warning", title: "Canceled" })
                const reader = new FileReader();
                reader.readAsDataURL(result.value);
                reader.onload = () => {
                    values = { ...values, itemImages: [...typeof(values.itemImages) !== "undefined" ? value.itemImages : [], reader.result] };
                    showItemAdd_AdminCP(6, values);
                };
                reader.onerror = () => Swal.fire({ icon: "error", title: "Failed to read the image!" });
            });
            break;
        }
        case 6: {
            const categoryName = await getValidItemCategories();
            Swal.fire({
                title,
                html: `Are you sure that you want to add this item ?<br/><br/>Name: ${values.itemName}<br/>Description: ${values.itemDescription}<br/>Category: ${categoryName[values.itemCategory]}<br/>Price: ${values.itemPrice}<br/>Stock: ${values.itemStock}<br/>Images: ${values.itemImages.length} <div style="display: flex;">${values.itemImages.map(image => `<img src="${image}" width="30%" />`)}</div>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, add it!',
                footer
            }).then((result) => {
                if(!result.isConfirmed || result.isDismissed) return Swal.fire({ icon: "warning", title: "Canceled" })
                fetch("/admincp/add-item", {
                    method: "PUT",
                    body: JSON.stringify(values),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(response => {
                    response.json().then(json => {
                        Toast.fire({
                            icon: !json.error ? "success" : "error",
                            title: json.message
                        });
                    }).catch(console.error);
                }).catch(console.error);
            });
        }
    }
};

const showItemRemove_AdminCP = () => {
    Swal.fire({
        title: "Remove item",
        input: 'text',
        inputLabel: 'Item ID',
        confirmButtonText: 'Remove',
        showCancelButton: true,
        inputValidator: (result) => !result && 'Please input the item ID!'
    }).then((result) => {
        if(!result.isConfirmed || result.isDismissed) return Swal.fire({ icon: "warning", title: "Canceled" })
        fetch("/admincp/remove-item", {
            method: "DELETE",
            body: JSON.stringify({ itemId: result.value }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            response.json().then(json => {
                Toast.fire({
                    icon: !json.error ? "success" : "error",
                    title: json.message
                });
            }).catch(console.error);
        }).catch(console.error);
    });
};

const showItemEdit_AdminCP = () => {
    Swal.fire({
        title: 'To be continued...',
        icon: 'info'
    });
};

// => Events listeners
categorySelect.addEventListener("change", (event) => {
    const selected = [...event.target.options].find(f => f.selected);
    if(!selected) return;
    window.location.href = `/product/search?query=${encodeURIComponent(searchBox.value)}&category=${selected.value}`;
});

searchBox.addEventListener("keypress", (event) => {
    if(event.key !== "Enter") return;
    event.preventDefault();
    const selected = [...categorySelect.options].find(f => f.selected);
    if(!selected) return;
    window.location.href = `/product/search?query=${encodeURIComponent(searchBox.value)}&category=${selected.value}`;
});