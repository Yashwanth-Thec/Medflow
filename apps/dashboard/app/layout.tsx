import type { ReactNode } from "react";
import "./styles.css";

export const metadata = {
  title: "Phonetree Dashboard",
  description: "Insurance verification jobs dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
