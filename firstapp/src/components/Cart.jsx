import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function Cart() {
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)
    const userId = localStorage.getItem("userId")

    useEffect(() => {
        fetchCart()
    }, [])

    // Fetch cart items
    async function fetchCart() {
        if (!userId) {
            alert("Login first to view your cart")
            return
        }
        axios.get("https://fullstack-firstapp.onrender.com/api/cart", { params: { userId } })
            .then(res => {
                if (res.status === 200) {
                    setCart(res.data)
                    setLoading(false)
                }
            })
            .catch(err => {
                console.error("Error fetching cart", err)
                setLoading(false)
            })
    }

    // Remove item from cart
    async function deleteItem(productId) {
        axios.delete(`https://fullstack-firstapp.onrender.com/api/cart/remove/${productId}`, {
            params: { userId }
        })
            .then(res => {
                if (res.status === 200) {
                    alert("Item removed from cart")
                    fetchCart()
                }
            })
            .catch(err => {
                console.error("Error deleting item", err)
            })
    }

    // Checkout (deduct stock and clear cart)
    async function checkout() {
        axios.post("https://fullstack-firstapp.onrender.com/api/cart/checkout", {}, { params: { userId } })
            .then(res => {
                if (res.status === 200) {
                    alert(res.data.message)
                    fetchCart()
                }
            })
            .catch(err => {
                if (err.response && err.response.data.message) {
                    alert(err.response.data.message)
                } else {
                    console.error("Error during checkout", err)
                }
            })
    }

    // Totals
    const totalQuantity = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    const totalPrice = cart?.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0

    return (
        <div className='container mt-4'>
            <h2>Your Cart</h2>
            {
                loading ? (<p>Loading...</p>) : (
                    !cart || cart.items.length === 0 ? (
                        <p>No products in cart</p>
                    ) : (
                        <>
                            {/* Totals at the top */}
                            <div className="mb-4">
                                <h4>Cart Summary</h4>
                                <p><b>Total Quantity:</b> {totalQuantity}</p>
                                <p><b>Total Price:</b> ₹{totalPrice}</p>
                                <button onClick={checkout} className="btn btn-success mt-2">Checkout</button>
                            </div>

                            {/* Cart items */}
                            <div className='row row-cols-1 row-cols-md-2 g-4 mt-3'>
                                {
                                    cart.items.map((item) => (
                                        <div className="col" key={item.product._id}>
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h5 className="card-title"><b>Name:</b> {item.product.name}</h5>
                                                    <p className="card-text"><b>Price: </b>₹{item.product.price}</p>
                                                    <p className="card-text"><b>Category: </b>{item.product.category}</p>
                                                    <p className="card-text"><b>Description: </b>{item.product.description}</p>
                                                    <p className="card-text"><b>Quantity: </b>{item.quantity}</p>
                                                    <p className="card-text"><b>Total: </b>₹{item.product.price * item.quantity}</p>
                                                    <button
                                                        onClick={() => deleteItem(item.product._id)}
                                                        className='btn btn-danger mt-2'>
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </>
                    )
                )
            }
        </div>
    )
}