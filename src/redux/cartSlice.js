import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;

      const existing = state.items.find(
        (item) =>
          String(item.productId) ===
            String(product.productId) &&
          item.size === product.size &&
          item.color === product.color
      );

      if (existing) {
        existing.quantity += product.quantity || 1;
      } else {
        state.items.push({
          ...product,
          quantity: product.quantity || 1,
        });
      }
    },

    removeFromCart: (state, action) => {
      const {
        productId,
        size,
        color,
      } = action.payload;

      state.items = state.items.filter(
        (item) =>
          !(
            String(item.productId) ===
              String(productId) &&
            item.size === size &&
            item.color === color
          )
      );
    },

    updateQuantity: (state, action) => {
      const {
        productId,
        size,
        color,
        quantity,
      } = action.payload;

      const item = state.items.find(
        (item) =>
          String(item.productId) ===
            String(productId) &&
          item.size === size &&
          item.color === color
      );

      if (item) {
        item.quantity = Math.max(
          1,
          Number(quantity)
        );
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;