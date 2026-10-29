"use client";

import Link from "next/link";
import { Search, ShoppingBag, User, Heart } from "lucide-react";
import { useSelector } from "react-redux";

const navLinks = [
  {
    name: "Shop",
    href: "/shop",
  },
  {
    name: "Men",
    href: "/men",
  },
  {
    name: "Women",
    href: "/women",
  },
  {
    name:"Kids",
    href:"/kids"
  },
  {
    name: "Accessories",
    href: "/accessories",
  },
  {
    name: "New Arrivals",
    href: "/new-arrivals",
  },
  {
    name: "Sale",
    href: "/sale",
  },
];

export default function Navbar() {
  const cartItems = useSelector((state) => state.cart.items);

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#faf9f7]/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">

        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl font-black tracking-[0.25em]"
        >
          LUXE
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-opacity hover:opacity-60"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-5">

          {/* SEARCH */}
          <Link
            href="/shop"
            aria-label="Search"
            className="transition-opacity hover:opacity-60"
          >
            <Search
              size={20}
              strokeWidth={1.7}
            />
          </Link>

          {/* PROFILE / ACCOUNT */}
          <Link
            href="/profile"
            aria-label="Profile"
            className="hidden transition-opacity hover:opacity-60 sm:block"
          >
            <User
              size={20}
              strokeWidth={1.7}
            />
          </Link>

          {/* WISHLIST */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative transition-opacity hover:opacity-60"
          >
            <Heart
              size={20}
              strokeWidth={1.7}
            />

            {wishlistItems.length > 0 && (
              <span className="absolute -right-3 -top-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] text-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* CART */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative transition-opacity hover:opacity-60"
          >
            <ShoppingBag
              size={20}
              strokeWidth={1.7}
            />

            {cartCount > 0 && (
              <span className="absolute -right-3 -top-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] text-white">
                {cartCount}
              </span>
            )}
          </Link>

        </div>
      </div>

      {/* MOBILE NAVIGATION */}
      <div className="border-t border-black/5 md:hidden">
        <nav className="flex gap-6 overflow-x-auto px-5 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium hover:opacity-60"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}