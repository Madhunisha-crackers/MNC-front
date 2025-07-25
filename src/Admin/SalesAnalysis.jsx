import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../Config';
import Sidebar from './Sidebar/Sidebar';
import Logout from './Logout';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg text-center shadow-md">
          An error occurred. Please try again or contact support.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SalesAnalysis() {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/sales-analysis/detailed`);
        setSalesData(response.data);
      } catch (err) {
        setError(`Failed to fetch sales data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesData();
  }, []);

  const formatValue = (value) => {
    const numValue = Number(value);
    return isNaN(numValue) ? '0.00' : numValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return '0.00%';
    return ((value / total) * 100).toFixed(2) + '%';
  };

  const renderTrendsReport = (trends) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Sales Trends Over Time</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border p-2 text-left dark:text-gray-100">Month</th>
            <th className="border p-2 text-right dark:text-gray-100">Sales Volume</th>
            <th className="border p-2 text-right dark:text-gray-100">Revenue (Rs)</th>
          </tr>
        </thead>
        <tbody>
          {trends.length > 0 ? (
            trends.map((t, index) => (
              <tr key={index}>
                <td className="border p-2 dark:text-gray-100">{t.month}</td>
                <td className="border p-2 text-right dark:text-gray-100">{t.volume}</td>
                <td className="border p-2 text-right dark:text-gray-100">₹{formatValue(t.revenue)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="border p-2 text-center dark:text-gray-100">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderProductReport = (products) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Product Performance</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border p-2 text-left dark:text-gray-100">Product</th>
            <th className="border p-2 text-right dark:text-gray-100">Units Sold</th>
            <th className="border p-2 text-right dark:text-gray-100">Revenue (Rs)</th>
            <th className="border p-2 text-right dark:text-gray-100">Avg. Discount</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((p, index) => (
              <tr key={index}>
                <td className="border p-2 dark:text-gray-100">{p.productname}</td>
                <td className="border p-2 text-right dark:text-gray-100">{p.quantity}</td>
                <td className="border p-2 text-right dark:text-gray-100">₹{formatValue(p.revenue)}</td>
                <td className="border p-2 text-right dark:text-gray-100">{p.avg_discount.toFixed(2)}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="border p-2 text-center dark:text-gray-100">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCityReport = (cities) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Regional Demand</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border p-2 text-left dark:text-gray-100">District</th>
            <th className="border p-2 text-right dark:text-gray-100">Bookings</th>
            <th className="border p-2 text-right dark:text-gray-100">Revenue (Rs)</th>
          </tr>
        </thead>
        <tbody>
          {cities.length > 0 ? (
            cities.map((c, index) => (
              <tr key={index}>
                <td className="border p-2 dark:text-gray-100">{c.district}</td>
                <td className="border p-2 text-right dark:text-gray-100">{c.count}</td>
                <td className="border p-2 text-right dark:text-gray-100">₹{formatValue(c.revenue)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="border p-2 text-center dark:text-gray-100">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderProfitabilityReport = (profitability) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Profitability Analysis</h2>
      <div className="space-y-2">
        <p className="text-sm dark:text-gray-100">Total Revenue: ₹{formatValue(profitability.total_revenue)}</p>
        <p className="text-sm dark:text-gray-100">Total Processing Fees: ₹{formatValue(profitability.total_fees)}</p>
        <p className="text-sm dark:text-gray-100">Total Discounts Given: ₹{formatValue(profitability.total_discounts)}</p>
        <p className="text-sm dark:text-gray-100">Estimated Net Profit: ₹{formatValue(profitability.estimated_profit)}</p>
      </div>
    </div>
  );

  const renderQuotationReport = (quotations) => {
    const total = quotations.pending.count + quotations.booked.count + quotations.canceled.count;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Quotation Conversion Rates</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="border p-2 text-left dark:text-gray-100">Status</th>
              <th className="border p-2 text-right dark:text-gray-100">Count</th>
              <th className="border p-2 text-right dark:text-gray-100">Percentage</th>
              <th className="border p-2 text-right dark:text-gray-100">Revenue (Rs)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 dark:text-gray-100">Pending</td>
              <td className="border p-2 text-right dark:text-gray-100">{quotations.pending.count}</td>
              <td className="border p-2 text-right dark:text-gray-100">{calculatePercentage(quotations.pending.count, total)}</td>
              <td className="border p-2 text-right dark:text-gray-100">₹{formatValue(quotations.pending.revenue)}</td>
            </tr>
            <tr>
              <td className="border p-2 dark:text-gray-100">Booked</td>
              <td className="border p-2 text-right dark:text-gray-100">{quotations.booked.count}</td>
              <td className="border p-2 text-right dark:text-gray-100">{calculatePercentage(quotations.booked.count, total)}</td>
              <td className="border p-2 text-right dark:text-gray-100">₹{formatValue(quotations.booked.revenue)}</td>
            </tr>
            <tr>
              <td className="border p-2 dark:text-gray-100">Canceled</td>
              <td className="border p-2 text-right dark:text-gray-100">{quotations.canceled.count}</td>
              <td className="border p-2 text-right dark:text-gray-100">{calculatePercentage(quotations.canceled.count, total)}</td>
              <td className="border p-2 text-right dark:text-gray-100">₹{formatValue(quotations.canceled.revenue)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const renderCustomerTypeReport = (customerTypes) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Customer Type Analysis</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border p-2 text-left dark:text-gray-100">Customer Type</th>
            <th className="border p-2 text-right dark:text-gray-100">Bookings</th>
            <th className="border p-2 text-right dark:text-gray-100">Revenue (Rs)</th>
          </tr>
        </thead>
        <tbody>
          {customerTypes.length > 0 ? (
            customerTypes.map((ct, index) => (
              <tr key={index}>
                <td className="border p-2 dark:text-gray-100">{ct.customer_type}</td>
                <td className="border p-2 text-right dark:text-gray-100">{ct.count}</td>
                <td className="border p-2 text-right dark:text-gray-100">₹{formatValue(ct.revenue)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="border p-2 text-center dark:text-gray-100">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen dark:bg-gray-800 bg-gray-50 mobile:flex-col">
        <Sidebar />
        <Logout />
        <div className="flex-1 md:ml-64 p-6 pt-16 mobile:p-2">
          <div className="w-full max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 mobile:text-2xl dark:text-gray-100">Market Analysis Report</h1>
            {loading && <div className="text-center text-gray-500">Loading...</div>}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg mb-6 text-center shadow-md mobile:text-sm mobile:px-3 mobile:py-2">
                {error}
              </div>
            )}
            {salesData && (
              <div className="space-y-8">
                {renderTrendsReport(salesData.trends || [])}
                {renderProductReport(salesData.products || [])}
                {renderCityReport(salesData.cities || [])}
                {renderProfitabilityReport(salesData.profitability || {})}
                {renderQuotationReport(salesData.quotations || {})}
                {renderCustomerTypeReport(salesData.customer_types || [])}
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}