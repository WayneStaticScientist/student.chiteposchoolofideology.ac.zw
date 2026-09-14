import clsx from "clsx";
import "@/styles/globals.css";

import { Metadata } from "next";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";
export const metadata: Metadata = {
  title: {
    absolute: "Chitepo School of Ideology",
    template: "Chitepo | %",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-gray-50 text-gray-900 font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "light",
            forcedTheme: "light",
          }}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
