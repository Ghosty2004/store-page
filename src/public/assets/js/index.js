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
const productToggleCart = (itemId, element) => {
    const div = element.querySelector("div");
    if(!div) return;
    console.log(div.classList);
    fetch(`/product/action/toggleCart/${itemId}`, { 
        method: "POST"
    }).then((response) => {
        response.json().then(json => {
            Toast.fire({
                icon: !json.error ? "success" : "error",
                title: json.message
            });
            if(json.error) return;
            div.className = json.type === "add" ? "remove-from-cart" : "add-to-cart";
        }).catch(console.error);
    }).catch(console.error);
};

const productToggleFavorite = (itemId, element) => {
    const div = element.querySelector("div");
    if(!div) return;
    fetch(`/product/action/toggleFavorite/${itemId}`, { 
        method: "POST" 
    }).then((response) => {
        response.json().then(json => {
            Toast.fire({
                icon: !json.error ? "success" : "error",
                title: json.message
            });
            if(json.error) return;
            div.className = json.type === "add" ? "remove-from-favorite" : "add-to-favorite";
        }).catch(console.error)
    }).catch(console.error);
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