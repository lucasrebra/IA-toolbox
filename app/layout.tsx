import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IA Toolbox · Lucas Rey",
  description: "Caja de herramientas de IA en Python para I+D e industria. Explora capacidades y compara alternativas según tu problema y fase del proyecto.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
