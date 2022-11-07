import express from "express";
import cookieParser from "cookie-parser";

// => Utils
import "./utils/index.js";

// => Functions
import { renderPage } from "./functions/index.js";

// => Pages
import user from "./routes/user.js";
import product from "./routes/product.js";
import admincp from "./routes/admincp.js";

const app = express();

app.use(express.static("src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", "src/views");

app.get("/", (request, response) => renderPage(request, response, "home"));

app.use("/user", user);
app.use("/product", product);
app.use("/admincp", admincp);

app.listen(3000, () => console.log("Server is running"));