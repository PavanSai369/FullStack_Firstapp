import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState({})
  const role = localStorage.getItem("role")
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    axios.get("https://fullstack-firstapp.onrender.com /api/product")
      .then((res) => {
        if (res.status === 200) {
          setProducts(res.data)
          setLoading(false)
        }
      })
  }

  function handleQuantityChange(productId, value) {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Number(value))
    }))
  }

  function addToCart(productId) {
    const userId = localStorage.getItem("userId")
    const quantity = quantities[productId] || 1

    if (!userId) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please login to add items to cart"
      })
      return
    }

    axios.post("https://fullstack-firstapp.onrender.com /api/cart/add",
      { productId, quantity },
      { params: { userId } }
    )
      .then(res => {
        if (res.status === 200) {
          Swal.fire({
            title: "Added!",
            text: "Product added to cart successfully!",
            icon: "success"
          })
          navigate("/cart")
        }
      })
      .catch(err => {
        if (err.response?.data?.message) {
          Swal.fire({
            icon: "error",
            title: "Stock Issue",
            text: err.response.data.message
          })
        } else {
          console.error("Error adding to cart", err)
        }
      })
  }

  function deleteProduct(productId) {
    axios.delete(`https://fullstack-firstapp.onrender.com /api/product/${productId}`)
      .then(res => {
        if (res.status === 200) {
          Swal.fire("Deleted!", "Product removed successfully", "success")
          fetchProducts()
        }
      })
      .catch(err => {
        console.error("Error deleting product", err)
      })
  }

  function truncate(text, wordLimit = 20) {
    return text.split(" ").slice(0, wordLimit).join(" ") + "..."
  }

  return (
    <div className='container mt-4'>
      <div className="bg-light p-4 rounded mb-4 shadow-sm">
        <h1 className="text-center mb-3">🛍️ Welcome to MyApp</h1>
        <p className="text-center text-muted fs-5">
          Your one-stop shop for the latest tech — <span className="text-success">Secure Checkout</span>, <span className="text-primary">Fast Delivery</span>, and <span className="text-warning">24/7 Support</span>
        </p>
        <div className="row text-center mt-3">
          <div className="col">
            <span className="fs-4">🔒</span><br />
            <small>Safe Payments</small>
          </div>
          <div className="col">
            <span className="fs-4">🚀</span><br />
            <small>Fast Shipping</small>
          </div>
          <div className="col">
            <span className="fs-4">🎁</span><br />
            <small>Exclusive Deals</small>
          </div>
          <div className="col">
            <span className="fs-4">📦</span><br />
            <small>Easy Returns</small>
          </div>
        </div>
      </div>
      <h2 className="mb-4">🛍️ Products</h2>
      {
        loading ? (<p>Loading...</p>) : (
          <div className='row row-cols-1 row-cols-md-3 g-4'>
            {
              products.map((i) => (
                <div className="col" key={i._id}>
                  <div className="card h-100 shadow-sm border-0">
                    <img src={i.image || "https://via.placeholder.com/300"} className="card-img-top" alt={i.name} />
                    <div className="card-body">
                      <h5 className="card-title">{i.name}</h5>
                      <p className="card-text text-success fw-bold fs-5">₹{i.price}</p>
                      <p className="card-text"><b>Category:</b> {i.category}</p>
                      <p className="card-text"><b>Description:</b> {truncate(i.description)}</p>
                      <p className={`card-text fw-semibold ${i.stock < 10 ? 'text-danger' : i.stock < 50 ? 'text-warning' : 'text-success'}`}>
                        Stock: {i.stock}
                      </p>

                      {role === "admin" ? (
                        <button onClick={() => deleteProduct(i._id)} className='btn btn-danger'>Delete</button>
                      ) : (
                        <>
                          <div className="input-group mb-2">
                            <span className="input-group-text">Qty</span>
                            <input
                              type="number"
                              min="1"
                              max={i.stock}
                              value={quantities[i._id] || 1}
                              onChange={(e) => handleQuantityChange(i._id, e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <button onClick={() => addToCart(i._id)} className='btn btn-warning w-100'>
                            🛒 Add to Cart
                          </button>
                        </>
                      )}
                    </div>
                    <div className="card-footer text-muted small d-flex justify-content-between">
                      <span>✅ Secure Checkout</span>
                      <span>🚚 Fast Delivery</span>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  )
}