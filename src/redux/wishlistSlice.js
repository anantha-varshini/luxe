import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",

  initialState,

  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;

      const exists = state.items.some(
        (item) =>
          String(item._id) === String(product._id)
      );

      if (exists) {
        state.items = state.items.filter(
          (item) =>
            String(item._id) !==
            String(product._id)
        );
      } else {
        state.items.push(product);
      }
    },

    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(
        (item) =>
          String(item._id) !==
          String(action.payload)
      );
    },

    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const {
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;