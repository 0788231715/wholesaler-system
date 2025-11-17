const Invoice = require('../models/invoice.model');
const Order = require('../models/order.model');

class InvoiceService {
  // Generate monthly revenue report
  async getMonthlyRevenue(year) {
    const matchStage = {
      $match: {
        status: 'paid',
        issueDate: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${parseInt(year) + 1}-01-01`)
        }
      }
    };

    const revenueByMonth = await Invoice.aggregate([
      matchStage,
      {
        $group: {
          _id: { $month: "$issueDate" },
          revenue: { $sum: "$totalAmount" },
          invoiceCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Fill in missing months with zero revenue
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const monthData = revenueByMonth.find(item => item._id === i + 1);
      return {
        month: i + 1,
        revenue: monthData ? monthData.revenue : 0,
        invoiceCount: monthData ? monthData.invoiceCount : 0
      };
    });

    return monthlyRevenue;
  }

  // Get outstanding invoices
  async getOutstandingInvoices() {
    return await Invoice.find({
      status: { $in: ['pending', 'overdue'] }
    })
      .populate('retailer', 'name company email')
      .populate('order')
      .sort({ dueDate: 1 });
  }

  // Calculate financial summary
  async getFinancialSummary() {
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    const [
      totalRevenue,
      currentMonthRevenue,
      previousMonthRevenue,
      outstandingAmount,
      paidInvoicesCount,
      pendingInvoicesCount
    ] = await Promise.all([
      // Total revenue
      Invoice.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      // Current month revenue
      Invoice.aggregate([
        { 
          $match: { 
            status: 'paid',
            issueDate: { $gte: currentMonthStart }
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      // Previous month revenue
      Invoice.aggregate([
        { 
          $match: { 
            status: 'paid',
            issueDate: { 
              $gte: previousMonthStart,
              $lt: currentMonthStart
            }
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      // Outstanding amount
      Invoice.aggregate([
        { $match: { status: { $in: ['pending', 'overdue'] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      // Paid invoices count
      Invoice.countDocuments({ status: 'paid' }),
      // Pending invoices count
      Invoice.countDocuments({ status: 'pending' })
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      currentMonthRevenue: currentMonthRevenue[0]?.total || 0,
      previousMonthRevenue: previousMonthRevenue[0]?.total || 0,
      outstandingAmount: outstandingAmount[0]?.total || 0,
      paidInvoicesCount,
      pendingInvoicesCount,
      revenueGrowth: previousMonthRevenue[0]?.total ? 
        ((currentMonthRevenue[0]?.total - previousMonthRevenue[0]?.total) / previousMonthRevenue[0]?.total * 100) : 0
    };
  }

  // Mark overdue invoices
  async markOverdueInvoices() {
    const today = new Date();
    const result = await Invoice.updateMany(
      {
        status: 'pending',
        dueDate: { $lt: today }
      },
      {
        $set: { status: 'overdue' }
      }
    );

    return result.modifiedCount;
  }
}

module.exports = new InvoiceService();