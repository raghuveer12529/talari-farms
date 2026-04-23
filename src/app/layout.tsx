import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: '--font-eb-garamond',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Talari Farms | Premium natural Harvest",
  description: "Experience the pure taste of nature. natural, premium produce delivered directly from Talari Farms.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${ebGaramond.variable} antialiased min-h-screen flex flex-col bg-white text-primary selection:bg-primary/10`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-surface border-t border-primary/5 py-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
            <div className="max-w-xs space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xl shadow-black/10 border border-primary/5 bg-black">
                  <img src="/logo.jpg" alt="Talari Farms Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight text-primary">Talari Farms</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Nature's Purest</span>
                </div>
              </div>
              <p className="text-sm text-primary/60 leading-relaxed font-medium">
                Sustainably grown, meticulously harvested, and delivered with care. From our soil to your home.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-6">Shop</h4>
                <ul className="space-y-3 text-sm font-medium text-primary/70">
                  <li><a href="/products" className="hover:text-primary transition-colors">Vegetables</a></li>
                  <li><a href="/products" className="hover:text-primary transition-colors">Fruits</a></li>
                  <li><a href="/products" className="hover:text-primary transition-colors">Specialty</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-6">Explore</h4>
                <ul className="space-y-3 text-sm font-medium text-primary/70">
                  <li><a href="/about" className="hover:text-primary transition-colors">Our Story</a></li>
                  <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
                  <li><a href="/partner-with-us" className="hover:text-primary transition-colors">Partners</a></li>
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-6">Account</h4>
                <ul className="space-y-3 text-sm font-medium text-primary/70">
                  <li><a href="/login" className="hover:text-primary transition-colors">Sign In</a></li>
                  <li><a href="/register" className="hover:text-primary transition-colors">Register</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-primary/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-primary/30">
            <div>© {new Date().getFullYear()} Talari Farms Inc.</div>
            <div className="flex gap-6 uppercase">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Service</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
