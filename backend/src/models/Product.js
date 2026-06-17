/**
 * Product Model
 * Stores product information with stock management
 */

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [3, "Product name must be at least 3 characters"],
            maxlength: [255, "Product name must not exceed 255 characters"],
        },
        stock: {
            type: Number,
            required: [true, "Stock is required"],
            min: [0, "Stock cannot be negative"],
            validate: {
                validator: Number.isInteger,
                message: "Stock must be an integer",
            },
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description must not exceed 1000 characters"],
            default: "",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index for faster queries
productSchema.index({ name: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
