import { connectDB } from "../../../utils/db";


export async function GET() {
  try {
    const db = await connectDB();
    const orders = await db.collection("orders").find().sort({ date: -1 }).toArray();

    if (orders.length === 0) {
      return Response.json({
        monthly: [],
        restaurantPie: [],
        topItems: [],
        deliveryStats: { total: 0, average: 0 },
        discountStats: { total: 0, average: 0 },
        peakTimes: {},
        orderHistory: [],
        summary: {
          totalSpent: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          totalDeliveryFees: 0,
          totalDiscounts: 0
        }
      });
    }

    // 1. Monthly Spending Trend
    const monthly = {};
    orders.forEach(o => {
      const key = new Date(o.date).toISOString().slice(0, 7);
      monthly[key] = (monthly[key] || 0) + o.amount;
    });
    const monthlyArr = Object.keys(monthly)
      .sort()
      .map(m => ({ 
        month: m, 
        amount: parseFloat(monthly[m].toFixed(2)),
        displayMonth: new Date(m + "-01").toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }));

    // 2. Restaurant-wise Breakdown
    const restaurants = {};
    const restaurantOrders = {};
    orders.forEach(o => {
      restaurants[o.restaurant] = (restaurants[o.restaurant] || 0) + o.amount;
      restaurantOrders[o.restaurant] = (restaurantOrders[o.restaurant] || 0) + 1;
    });
    const restaurantPie = Object.keys(restaurants)
      .map(r => ({ 
        name: r, 
        value: parseFloat(restaurants[r].toFixed(2)),
        orders: restaurantOrders[r]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 restaurants

    // 3. Top Items Ordered
    const itemsMap = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const key = item.name;
        if (!itemsMap[key]) {
          itemsMap[key] = { name: key, count: 0, totalSpent: 0 };
        }
        itemsMap[key].count += item.quantity;
        itemsMap[key].totalSpent += item.price * item.quantity;
      });
    });
    const topItems = Object.values(itemsMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
      .map(item => ({
        ...item,
        totalSpent: parseFloat(item.totalSpent.toFixed(2))
      }));

    // 4. Delivery Fee Statistics
    const deliveryFees = orders.map(o => o.deliveryFee || 0).filter(f => f > 0);
    const deliveryStats = {
      total: parseFloat(deliveryFees.reduce((sum, f) => sum + f, 0).toFixed(2)),
      average: deliveryFees.length > 0 
        ? parseFloat((deliveryFees.reduce((sum, f) => sum + f, 0) / deliveryFees.length).toFixed(2))
        : 0,
      count: deliveryFees.length
    };

    // 5. Discount Statistics
    const discounts = orders.map(o => o.discount || 0).filter(d => d > 0);
    const discountStats = {
      total: parseFloat(discounts.reduce((sum, d) => sum + d, 0).toFixed(2)),
      average: discounts.length > 0
        ? parseFloat((discounts.reduce((sum, d) => sum + d, 0) / discounts.length).toFixed(2))
        : 0,
      count: discounts.length
    };

    // 6. Peak Ordering Times (Hour of day)
    const hourCounts = {};
    const dayCounts = {};
    orders.forEach(o => {
      const date = new Date(o.date);
      const hour = date.getHours();
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const peakHours = Object.keys(hourCounts)
      .map(h => ({
        hour: parseInt(h),
        displayHour: `${h}:00`,
        orders: hourCounts[h]
      }))
      .sort((a, b) => a.hour - b.hour);

    const peakDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      orders: dayCounts[day] || 0
    }));

    // 7. Category/Time-based Heatmap Data
    const heatmapData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let hour = 0; hour < 24; hour++) {
      days.forEach(day => {
        const count = orders.filter(o => {
          const d = new Date(o.date);
          return d.getHours() === hour && 
                 d.toLocaleDateString('en-US', { weekday: 'short' }) === day;
        }).length;
        
        if (count > 0) {
          heatmapData.push({ day, hour, count });
        }
      });
    }

    // 8. Order History (Last 50 orders)
    const orderHistory = orders.slice(0, 50).map(o => ({
      id: o._id.toString(),
      date: new Date(o.date).toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      restaurant: o.restaurant,
      items: (o.items || []).map(i => `${i.quantity}x ${i.name}`).join(", ") || "N/A",
      amount: parseFloat(o.amount.toFixed(2)),
      deliveryFee: parseFloat((o.deliveryFee || 0).toFixed(2)),
      discount: parseFloat((o.discount || 0).toFixed(2)),
      taxes: parseFloat((o.taxes || 0).toFixed(2))
    }));

    // 9. Summary Statistics
    const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);
    const summary = {
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      totalOrders: orders.length,
      averageOrderValue: parseFloat((totalSpent / orders.length).toFixed(2)),
      totalDeliveryFees: deliveryStats.total,
      totalDiscounts: discountStats.total,
      totalTaxes: parseFloat(orders.reduce((sum, o) => sum + (o.taxes || 0), 0).toFixed(2)),
      mostOrderedRestaurant: restaurantPie[0]?.name || "N/A",
      favoriteItem: topItems[0]?.name || "N/A"
    };

    // 10. Spending Trends (Last 6 months)
    const last6Months = monthlyArr.slice(-6);

    return Response.json({
      monthly: monthlyArr,
      restaurantPie,
      restaurantBar: restaurantPie, // Same data for bar chart
      topItems,
      deliveryStats,
      discountStats,
      peakHours,
      peakDays,
      heatmapData,
      orderHistory,
      summary,
      last6Months
    });

  } catch (error) {
    console.error("Get orders error:", error);
    return Response.json({ 
      error: error.message,
      details: "Failed to retrieve analytics data"
    }, { status: 500 });
  }
}