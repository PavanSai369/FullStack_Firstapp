import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold" to="/">
                    <i className="fas fa-store me-2"></i>MyApp
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                <i className="fas fa-home me-1"></i>Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/cart">
                                <i className="fas fa-shopping-cart me-1"></i>Cart
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/logout">
                                <i className="fas fa-sign-out-alt me-1"></i>Logout
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}