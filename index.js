"use strict";

require("dotenv").config({ path: "./src/.env" });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const app = express();

const indexRouter = require("./src/routes/index.route");
const dbConnect = require('./src/config/dbConnect');
const { errorHandler } = require('./src/middleware/errorHandler');

const PORT = process.env.PORT;

dbConnect();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/api", indexRouter);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
