import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Page from "@/models/Page";
import SearchBar from "@/components/SearchBar"; 
import { CartProvider } from "@/context/CartContext";
import CartMenu from "@/components/CartMenu";

// Cache the footer for 1 hour so we don't spam the database
export const revalidate = 3600;

async function getHeaderPages() {
  try {
    await connectToDatabase();
    
    // CRITICAL FIX: Only fetch pages pinned to the header THAT ARE ALSO PUBLISHED
    const pages = await Page.find({ 
      inHeader: true, 
      isPublished: true // Bypasses drafts so they stay hidden!
    })
    .select("title slug")
    .lean();
      
    return JSON.parse(JSON.stringify(pages));
  } catch (error) {
    console.error("Failed to fetch header pages:", error);
    return [];
  }
}

async function getFooterPages() {
  try {
    await connectToDatabase();
    const pages = await Page.find({ isPublished: true }).select("title slug footerPlacement").lean();
    return JSON.parse(JSON.stringify(pages));
  } catch (error) {
    console.error("Failed to fetch footer pages:", error);
    return [];
  }
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the pages before rendering the layout
  const footerPages = await getFooterPages();
  const headerPages = await getHeaderPages();
  const quickLinks = footerPages.filter((page: any) => page.footerPlacement === 'quick_links' || !page.footerPlacement);
  const legalLinks = footerPages.filter((page: any) => page.footerPlacement === 'legal');

  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 text-black">
        {/* Public Store Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* 1. LEFT: The Logo */}
            <div className="shrink-0">
              <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
                TechStore
              </Link>
            </div>
            
            {/* 2. CENTER: Navigation Links & Search */}
            {/* Added flex-1 and justify-center to dynamically center this block */}
            <nav className="hidden md:flex flex-1 items-center justify-center space-x-8 font-medium text-gray-600 px-8">
              <Link href="/pages/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
              <Link href="/pages/categories" className="hover:text-blue-600 transition-colors">Categories</Link>
              <Link href="/blogs" className="hover:text-blue-600 transition-colors">Blogs</Link>
              
              {/* Dynamic CMS pages */}
              {headerPages.map((page: any) => (
                <Link 
                  key={page._id} 
                  href={`/pages/${page.slug}`} 
                  className="hover:text-blue-600 transition-colors capitalize"
                >
                  {page.title}
                </Link>
              ))}

              <SearchBar />
            </nav>

            {/* 3. RIGHT: Cart Menu & Admin Panel */}
            {/* Moved OUT of the nav tag so it sits independently on the far right */}
            <div className="flex items-center space-x-6 shrink-0">
              <CartMenu />

              <Link href="/admin" className="text-sm bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                Admin Panel
              </Link>
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="grow w-full">
          {children}
        </main>

        {/* Upgraded Public Store Footer */}
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">TechStore</h3>
                <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                  We are dedicated to bringing you the best premium gadgets and tech accessories. Sourced directly from top manufacturers to ensure quality, reliability, and performance.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Support</h3>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li><Link href="/pages/faq" className="hover:text-blue-600">FAQs</Link></li>
                  <li><Link href="/pages/contact-us" className="hover:text-blue-600">Contact Us</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
                <ul className="space-y-3 text-sm text-gray-500">
                  
                  {/* Upgraded: Now only maps over pages tagged for Quick Links */}
                  {quickLinks.map((page: any) => (
                    <li key={page._id.toString()}>
                      <Link href={`/pages/${page.slug}`} className="hover:text-blue-600 capitalize">
                        {page.title}
                      </Link>
                    </li>
                  ))}
                  
                </ul>
              </div>
            </div>
            <div className="text-center text-sm text-gray-400 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p>&copy; {new Date().getFullYear()} TechStore. All rights reserved.</p>
              
              <div className="mt-4 md:mt-0 space-x-6 flex">
                {/* Upgraded: Dynamically maps the legal/policy pages here */}
                {legalLinks.map((page: any) => (
                  <Link 
                    key={page._id.toString()} 
                    href={`/pages/${page.slug}`} 
                    className="hover:text-gray-600 transition-colors"
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
              
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}