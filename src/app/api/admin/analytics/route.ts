import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Current Live Inventory Health
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 5 }, isActive: true });
    const totalProducts = await Product.countDocuments({ isActive: true });

    // 2. Aggregate Lifetime Orders Summary 
    // We strictly ignore "Cancelled" transactions to keep business metrics accurate
    const orderSummary = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" }, // Matches 'total' on your schema root
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = orderSummary[0]?.totalRevenue || 0;
    const totalOrders = orderSummary[0]?.totalOrders || 0;

    // 3. Aggregate Weekly Revenue Velocity (Past 7 Days Breakdown)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const rawSalesOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%b %d", date: "$createdAt" } }, // Formats to "Jul 20"
          Revenue: { $sum: "$total" },
          Orders: { $sum: 1 },
          rawDate: { $min: "$createdAt" }
        }
      },
      { $sort: { rawDate: 1 } }
    ]);

    // Backfill any empty gap days in the last week with zeros so the chart layout remains uniform
    const salesOverTime = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateString = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      const foundDay = rawSalesOverTime.find(item => item._id === dateString);
      return {
        date: dateString,
        Revenue: foundDay ? foundDay.Revenue : 0,
        Orders: foundDay ? foundDay.Orders : 0
      };
    });

    // 4. Aggregate Sales by Segment (Category Breakdown)
    // Since categories reside on products, we lookup using the product field inside your items array
    const categorySales = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $unwind: "$items" }, // Flattens your nested items array row-by-row
      {
        $lookup: {
          from: "products", // Matches the Mongoose collection name registered for Product
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          // Multiplies your item quantity and price fields dynamically per row
          value: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id", // Transforms fields to match what Recharts expects
          value: 1
        }
      },
      { $sort: { value: -1 } }
    ]);

    return NextResponse.json({
      kpis: {
        totalRevenue,
        totalOrders,
        lowStockCount,
        totalProducts,
      },
      salesOverTime,
      categorySales,
    });
  } catch (error) {
    console.error("Database analytics aggregation failed:", error);
    return NextResponse.json({ error: "Failed to extract dynamic metrics" }, { status: 500 });
  }
}