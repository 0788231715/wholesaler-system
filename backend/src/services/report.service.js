const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Invoice = require('../models/invoice.model');

class ReportService {
  // Sales report by date range
  async getSalesReport(startDate, endDate, groupBy = 'day') {
    const matchStage = {
      $match: {
        status: 'delivered',
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    };

    let groupStage;
    switch (groupBy) {
      case 'month':
        groupStage = {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            totalSales: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: "$totalAmount" }
          }
        };
        break;
      case 'week':
        groupStage = {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              week: { $week: "$createdAt" }
            },
            totalSales: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: "$totalAmount" }
          }
        };
        break;
      default: // day
        groupStage = {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            totalSales: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: "$totalAmount" }
          }
        };
    }

    const salesData = await Order.aggregate([
      matchStage,
      groupStage,
      { $sort: { "_id": 1 } }
    ]);

    return salesData;
  }

  // Product performance report
  async getProductPerformanceReport(startDate, endDate) {
    const productPerformance = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          productName: "$product.name",
          category: "$product.category",
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          averagePrice: { $divide: ["$totalRevenue", "$totalQuantity"] }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    return productPerformance;
  }

  // Stock report
  async getStockReport() {
    const stockReport = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'producer',
          foreignField: '_id',
          as: 'producer'
        }
      },
      { $unwind: "$producer" },
      {
        $project: {
          name: 1,
          category: 1,
          price: 1,
          stock: 1,
          minOrderQuantity: 1,
          unit: 1,
          producerName: "$producer.name",
          producerCompany: "$producer.company",
          stockStatus: {
            $cond: {
              if: { $eq: ["$stock", 0] },
              then: "Out of Stock",
              else: {
                $cond: {
                  if: { $lt: ["$stock", 10] },
                  then: "Low Stock",
                  else: "In Stock"
                }
              }
            }
          }
        }
      },
      { $sort: { stock: 1 } }
    ]);

    return stockReport;
  }

  // Customer report
  async getCustomerReport() {
    const customerReport = await Order.aggregate([
      {
        $match: { status: 'delivered' }
      },
      {
        $group: {
          _id: "$retailer",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
          firstOrderDate: { $min: "$createdAt" },
          lastOrderDate: { $max: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'retailer'
        }
      },
      { $unwind: "$retailer" },
      {
        $project: {
          retailerName: "$retailer.name",
          retailerCompany: "$retailer.company",
          retailerEmail: "$retailer.email",
          totalOrders: 1,
          totalSpent: 1,
          averageOrderValue: 1,
          firstOrderDate: 1,
          lastOrderDate: 1
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    return customerReport;
  }

  // Producer performance report
  async getProducerPerformanceReport() {
    const producerPerformance = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'orders'
        }
      },
      {
        $unwind: {
          path: "$orders",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          "orders.status": "delivered"
        }
      },
      {
        $group: {
          _id: "$producer",
          totalProducts: { $sum: 1 },
          totalSales: { $sum: "$orders.items.total" },
          totalUnitsSold: { $sum: "$orders.items.quantity" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'producer'
        }
      },
      { $unwind: "$producer" },
      {
        $project: {
          producerName: "$producer.name",
          producerCompany: "$producer.company",
          totalProducts: 1,
          totalSales: 1,
          totalUnitsSold: 1,
          averageProductValue: { $divide: ["$totalSales", "$totalUnitsSold"] }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    return producerPerformance;
  }

  // System overview dashboard data
  async getDashboardData() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      financialSummary
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ stock: { $lt: 10, $gt: 0 } }),
      Order.find()
        .populate('retailer', 'name company')
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      this.getFinancialSummary()
    ]);

    return {
      totals: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        pendingOrders
      },
      alerts: {
        lowStockProducts
      },
      recentOrders,
      financialSummary
    };
  }

  async getFinancialSummary() {
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: currentMonth }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0
    };
  }
}

module.exports = new ReportService();