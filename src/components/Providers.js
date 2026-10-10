"use client";

import ReduxProvider from "@/redux/Provider";

export default function Providers({ children }) {
  return <ReduxProvider>{children}</ReduxProvider>;
}