const mongoose = require("mongoose");

const BookModel = mongoose.model("book", {
    title: String,
    price: Number,
    author: String,
    category: String
});

module.exports = BookModel;
