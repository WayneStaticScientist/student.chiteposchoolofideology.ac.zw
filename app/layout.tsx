import clsx from "clsx";
import "@/styles/globals.css";

import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";
import { Metadata } from "next";
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
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
