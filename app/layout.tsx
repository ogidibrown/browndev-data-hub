import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "BrownDev Data Hub",
  description: "Buy MTN, Telecel & AirtelTigo data bundles instantly in Ghana",
  keywords: "data bundles, Ghana, MTN, Telecel, AirtelTigo, buy data online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1E293B",
              color: "#F8FAFC",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#22C55E", secondary: "#1E293B" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#1E293B" },
            },
          }}
        />
        </AuthProvider>
      </body>
    </html>
  );
}
