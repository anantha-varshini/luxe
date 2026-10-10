import "./globals.css";

import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "LUXE — Modern Fashion",
  description:
    "Discover modern fashion, premium essentials and timeless styles.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}