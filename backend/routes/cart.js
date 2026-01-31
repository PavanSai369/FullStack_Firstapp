const express = require("express")
const router = express.Router()
const Cart = require("../models/Carts.js")
const Product = require("../models/Product.js")

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    const userId = req.query.userId
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized. Login first" })
    }
    req.userId = userId
    next()
}

// Get cart for a user
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.userId }).populate("items.product")
        if (!cart) {
            return res.status(200).json({ items: [] })
        }
        return res.status(200).json(cart)
    } catch (err) {
        console.error("Error while fetching cart", err)
        return res.status(500).json({ message: "Internal server error" })
    }
})

// Add item to cart with stock validation
router.post("/add", isAuthenticated, async (req, res) => {
    const { productId, quantity = 1 } = req.body
    try {
        let cart = await Cart.findOne({ user: req.userId })
        if (!cart) {
            cart = new Cart({ user: req.userId, items: [] })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        const existingItem = cart.items.find(item => item.product.toString() === productId)

        if (existingItem) {
            const newQuantity = existingItem.quantity + Number(quantity)
            if (newQuantity > product.stock) {
                return res.status(400).json({ message: "Not enough stock available" })
            }
            existingItem.quantity = newQuantity
        } else {
            if (quantity > product.stock) {
                return res.status(400).json({ message: "Not enough stock available" })
            }
            cart.items.push({ product: productId, quantity: Number(quantity) })
        }

        await cart.save()
        return res.status(200).json({ message: "Cart updated", cart })
    } catch (err) {
        console.error("Error while adding to cart", err)
        return res.status(500).json({ message: "Internal server error while adding to cart" })
    }
})

// Remove item from cart
router.delete("/remove/:productId", isAuthenticated, async (req, res) => {
    try {
        const { productId } = req.params
        const cart = await Cart.findOne({ user: req.userId })

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" })
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId)
        await cart.save()

        return res.status(200).json({ message: "Item removed from cart" })
    } catch (err) {
        console.error("Error removing item from cart", err)
        return res.status(500).json({ message: "Internal server error while removing item" })
    }
})
// Checkout route - deduct stock only when confirming order
router.post("/checkout", isAuthenticated, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.userId }).populate("items.product")

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" })
        }

        // Validate stock for each item
        for (let item of cart.items) {
            if (item.quantity > item.product.stock) {
                return res.status(400).json({
                    message: `Not enough stock for ${item.product.name}. Available: ${item.product.stock}`
                })
            }
        }

        // Deduct stock
        for (let item of cart.items) {
            const product = await Product.findById(item.product._id)
            product.stock -= item.quantity
            await product.save()
        }

        // Clear cart after checkout
        cart.items = []
        await cart.save()

        return res.status(200).json({ message: "Order placed successfully. Stock updated." })
    } catch (err) {
        console.error("Error during checkout", err)
        return res.status(500).json({ message: "Internal server error during checkout" })
    }
})

module.exports = router
