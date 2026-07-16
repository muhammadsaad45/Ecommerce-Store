import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCart from "@/components/AddToCart";
import mongoose from "mongoose";
import ProductSpecs from "@/components/ProductSpecs";
import ProductImageGallery from "@/components/ProductImageGallery";

type ProductSpecPayload = {
  group?: string;
  key?: string;
  value?: string;
};

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectToDatabase();
  const isId = mongoose.Types.ObjectId.isValid(slug);
  const query = isId 
    ? { _id: slug, isActive: true } 
    : { slug, isActive: true };

  const rawProduct = await Product.findOne(query).lean();
  if (!rawProduct) {
    return { title: "Product Not Found | TechStore" };
  }

  return {
    title: `${rawProduct.name} | TechStore`,
    description: rawProduct.description.substring(0, 160),
    openGraph: {
      images: [rawProduct.imageUrl, ...(rawProduct.images || [])].filter(Boolean),
    },
  };
}

// 2. The Main Page Component
export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  await connectToDatabase();
  
  const isId = mongoose.Types.ObjectId.isValid(slug);
  const query = isId 
    ? { _id: slug, isActive: true } 
    : { slug, isActive: true };

  const rawProduct = await Product.findOne(query).lean();

  if (!rawProduct) {
    notFound();
  }

  // Safely serialize the Mongoose document for the Client Component
  // Safely serialize the Mongoose document for the Client Component
  const product = {
    ...rawProduct,
    _id: rawProduct._id.toString(),
    images: rawProduct.images?.length > 0 ? rawProduct.images : rawProduct.imageUrl ? [rawProduct.imageUrl] : [],
    // NEW: We map over the specs and explicitly only return the text strings, 
    // leaving the MongoDB _id behind on the server!
    specs: rawProduct.specs?.map((spec: ProductSpecPayload) => ({
      group: spec.group,
      key: spec.key,
      value: spec.value,
    })) || [],
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 flex items-center text-sm font-medium text-gray-500">
        <Link href="/pages/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
        <span className="mx-2">&rsaquo;</span>
        <Link href={`/pages/categories`} className="hover:text-blue-600 transition-colors">Categories</Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-gray-900 capitalize">{product.category}</span>
      </nav>

      {/* TOP SECTION: Image and Core Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
        
        {/* Left Column: Product Image */}
        <ProductImageGallery images={product.images} alt={product.name} stock={product.stock} />

        {/* Right Column: Product Info & Actions */}
        <div className="flex flex-col pt-4">
          <div className="mb-2 text-sm font-bold text-blue-600 uppercase tracking-widest">
            {product.category}
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            {product.name}
          </h1>
          
          <div className="text-3xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-8">
            ${product.price.toFixed(2)}
          </div>
          
          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Product Overview</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          <div className="mt-auto">
            <AddToCart product={product} />
          </div>

          {/* Trust Badges */}
          <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm font-medium text-gray-500">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>1 Year Warranty</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Secure Checkout</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* BOTTOM SECTION: Dynamic Specifications Matrix */}
      {/* We moved it down here so it has room to expand fully! */}
      <ProductSpecs specs={product.specs} />

    </div>
  );
}