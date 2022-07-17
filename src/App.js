import React, { useState, useEffect } from "react";
import { ThemeProvider } from "@material-ui/core";
import Navbar from "./Components/Navbar/Navbar";
import Products from "./Components/Products/Products";
import { commerce } from "./lib/commerce";
import Cart from "./Components/Cart/Cart";
import { Paper } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Checkout from "./Components/CheckoutForm/Checkout/Checkout";

export const App = () => {
  const [products, setProduct] = useState([]);
  const [cart, setCart] = useState({});
  const [dark, setDark] = useState(JSON.parse(localStorage.getItem("dark")));
  const [order, setOrder] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleToggleDark = () => {
    setDark(!dark);
    localStorage.setItem("dark", JSON.stringify(!dark));
  };

  const theme = createTheme({
    palette: {
      type: dark ? "dark" : "light",
    },
  });

  const fetchProducts = async () => {
    const { data } = await commerce.products.list();
    setProduct(data);
  };

  const fetchCart = async () => {
    setCart(await commerce.cart.retrieve());
  };

  const handleAddToCart = async (productId, quantity) => {
    const { cart } = await commerce.cart.add(productId, quantity);
    setCart(cart);
  };

  const handleUpdateCartQty = async (productId, quantity) => {
    const { cart } = await commerce.cart.update(productId, { quantity });
    setCart(cart);
  };

  const handleRemoveFromCart = async (productId) => {
    const { cart } = await commerce.cart.remove(productId);
    setCart(cart);
  };

  const handleEmpyCart = async () => {
    const { cart } = await commerce.cart.empty();
    console.log(cart);
    setCart(cart);
  };

  const refreshCart = async () => {
    const newCart = await commerce.cart.refresh();
    setCart(newCart);
  };

  const handleCaptureCheckout = async (checkoutTokenId, newOrder) => {
    try {
      const incomingOrder = await commerce.checkout.capture(
        checkoutTokenId,
        newOrder
      );
      setOrder(incomingOrder);
      refreshCart();
    } catch (error) {
      setErrorMessage(error.data.error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Paper style={{ minHeight: "100vh" }}>
        <Router>
          <Navbar
            totalItems={cart?.total_items}
            dark={dark}
            onToggleDark={handleToggleDark}
          />
          <Switch>
            <Route exact path="/">
              <Products products={products} onAddToCart={handleAddToCart} />
            </Route>
            <Route exact path="/cart">
              <Cart
                cart={cart}
                onUpdateCartQty={handleUpdateCartQty}
                onRemoveFromCart={handleRemoveFromCart}
                onEmpyCart={handleEmpyCart}
              />
            </Route>
            <Route exact path="/checkout">
              <Checkout
                cart={cart}
                order={order}
                onCaptureCheckout={handleCaptureCheckout}
                error={errorMessage}
              />
            </Route>
          </Switch>
        </Router>
      </Paper>
    </ThemeProvider>
  );
};
