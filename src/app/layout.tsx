import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProviderBlog } from "@/contexts/AuthContextBlog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const geistSans = localFont({
  src: "./fonts/Poppins-Regular.ttf",
  variable: "--font-poppins-regular",
  weight: "100 900",
});

export async function generateMetadata(): Promise<Metadata> {
  let blog = null;
  
  try {
    const response = await fetch(`${API_URL}configuration_blog/get_configs`, {
      headers: { 'Cache-Control': 'public, max-age=3600' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    blog = await response.json();
  } catch (error) {
    console.error("Error fetching blog configuration:", error);
  }

  // Fallback para valores padrão
  const defaultMetadata = {
    title: "Blog",
    description: "Descrição do blog",
    favicon: "../app/favicon.ico",
  };

  const faviconUrl = blog?.favicon
    ? new URL(`files/${blog.favicon}`, API_URL).toString()
    : defaultMetadata.favicon;

  return {
    title: blog?.name_blog || defaultMetadata.title,
    description: blog?.description_blog || defaultMetadata.description,
    icons: {
      icon: faviconUrl,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body id="root" className={`${geistSans.variable} antialiased`}>
        <AuthProvider>
          <AuthProviderBlog>
            <ToastContainer autoClose={5000} />
            {children}
          </AuthProviderBlog>
        </AuthProvider>
      </body>
    </html>
  );
}