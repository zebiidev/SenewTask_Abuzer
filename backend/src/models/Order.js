/**
 * Order Model
 * Stores completed orders after checkout
 */

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, "User ID is required"],
            trim: true,
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: [true, "Product ID is required"],
                },
                quantity: {
                    type: Number,
                    required: [true, "Quantity is required"],
                    min: [1, "Quantity must be at least 1"],
                    validate: {
                        validator: Number.isInteger,
                        message: "Quantity must be an integer",
                    },
                },
                price: {
                    type: Number,
                    required: [true, "Price at time of order is required"],
                }
            }
        ],
        totalPrice: {
            type: Number,
            required: [true, "Total price is required"],
            min: [0, "Total price cannot be negative"],
        },
        status: {
            type: String,
            enum: ["completed", "pending", "cancelled"],
            default: "completed",
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
orderSchema.index({ userId: 1 });
orderSchema.index({ "items.productId": 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
