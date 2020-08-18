/**
 * project JSDoc description
 * @module {Object} module name
 * @version 1.0.0
 * @author author name
 * @requires dependency 1
 * @requires dependency 2
 * ...
 */

"use strict";

//================================================================================
// dependencies
//================================================================================
const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const BookModel = require("./lib/bookModel");

//================================================================================
// config
//================================================================================
/** import here configurations */

//================================================================================
// aliases
//================================================================================
/** declare here local variables aliasing some of often used imports / conf options */

//================================================================================
// module
//================================================================================
const databaseURL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/books";
mongoose.connect(databaseURL, { useNewUrlParser: true });

const server = Hapi.server({
    port: 3003,
    host: "127.0.0.1",
});

server.route({
    method: "GET",
    path: "/book",
    handler: async (request, response) => {
        try {
            const books = await BookModel.find().exec();
            return response.response(books);
        } catch (error) {
            return response.response(error).code(500);
        } 
    }
});

server.route({
    method: "GET",
    path: "/book/{id}",
    handler: async (request, response) => {
        try {
            const book = await BookModel.findById(request.params.id).exec();
            return response.response(book);
        } catch (error) {
            return response.response(error).code(500);
        } 
    }
});

server.route({
    method: "DELETE",
    path: "/book/{id}",
    handler: async (request, response) => {
        try {
            const result = await BookModel.findByIdAndDelete(request.params.id).exec();
            return response.response(result);
        } catch (error) {
            return response.response(error).code(500);
        } 
    }
});

server.route({
    method: "POST",
    path: "/book",
    options: {
        validate: {
            payload: Joi.object({
                title: Joi.string().required(),
                price: Joi.number().required(),
                author: Joi.string(),
                category: Joi.string().required()
            }),
            failAction: (request, res, error) => {
                return error.isJoi ? res.response(error.details[0]).takeover() : res.response(error).takeover();
            }
        },        
    },
    handler: async (request, res) => {
        try {
            const book = new BookModel(request.payload);
            const result = await book.save();
            return res.response(result);
        } catch (error) {
            return res.response(error).code(500);
        } 
    }
});

server.route({
    method: "PUT",
    path: "/book/{id}",
    options: {
        validate: {
            payload: Joi.object({
                title: Joi.string().optional(),
                price: Joi.number().optional(),
                author: Joi.optional(),
                category: Joi.string().optional()
            }),
            failAction: (request, res, error) => {
                return error.isJoi ? res.response(error.details[0]).takeover() : res.response(error).takeover();
            }
        },        
    },
    handler: async (request, res) => {
        try {
            const result = await BookModel.findByIdAndUpdate(request.params.id, request.payload, { new : true });
            return res.response(result);
        } catch (error) {
            return res.response(error).code(500);
        } 
    }
});

server.start();
console.log(`Server running on ${server.info.uri}`);

process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
});
