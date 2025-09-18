import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import type { CustomerAnalytics } from "./StatComponents";

interface ChartProps {
  revenueChartData: Array<{ month: string; revenue: number; commission: number; target: number }>;
  shopsChartData: Array<{ month: string; total: number; active: number; pending: number; suspended: number }>;
  customerChartData: Array<{ month: string; total: number; new: number; active: number }>;
  bookingsChartData: any[];
  serviceTypePieData: Array<{ name: string; value: number; color: string }>;
  customerAnalytics: CustomerAnalytics | null;
  showCustomersGraph: boolean;
  setShowCustomersGraph: (value: boolean) => void;
  showRevenueGraph: boolean;
  setShowRevenueGraph: (value: boolean) => void;
  showShopsGraph: boolean;
  setShowShopsGraph: (value: boolean) => void;
  showBookingsGraph: boolean;
  setShowBookingsGraph: (value: boolean) => void;
  showServiceTypeGraph: boolean;
  setShowServiceTypeGraph: (value: boolean) => void;
}


export const ShopsChart: React.FC<ChartProps> = ({ shopsChartData, showShopsGraph, setShowShopsGraph }) => (
  <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-900">Shop Growth & Status</h3>
      <p className="text-sm text-gray-600">Track shop registrations and status changes</p>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={shopsChartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend />
        <Bar dataKey="active" fill="#10B981" name="Active Shops" />
        <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
        <Bar dataKey="suspended" fill="#EF4444" name="Suspended" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const CustomersChart: React.FC<ChartProps> = ({ customerChartData, showCustomersGraph, setShowCustomersGraph }) => (
  <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-900">Customer Growth & Engagement</h3>
      <p className="text-sm text-gray-600">
        Track total customers, new registrations, and active user trends over time
      </p>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={customerChartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#3B82F6"
          strokeWidth={3}
          name="Total Customers"
          dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="new"
          stroke="#10B981"
          strokeWidth={2}
          name="New Registrations"
          dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="active"
          stroke="#8B5CF6"
          strokeWidth={2}
          name="Active Users"
          dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const CustomerDemographicsChart: React.FC<ChartProps> = ({ customerAnalytics }) => {
  if (!customerAnalytics?.demographics) return null;

  const genderData = [
    { name: "Male", value: customerAnalytics.demographics.genderBreakdown.male, color: "#3B82F6" },
    { name: "Female", value: customerAnalytics.demographics.genderBreakdown.female, color: "#10B981" },
    { name: "Other", value: customerAnalytics.demographics.genderBreakdown.other, color: "#8B5CF6" },
  ].filter(item => item.value > 0);

  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Customer Demographics</h3>
        <p className="text-sm text-gray-600">Gender distribution of registered customers</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Age Group Distribution</h4>
            <div className="space-y-2">
              {customerAnalytics.demographics.ageGroups.map((group: { range: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; count: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, index: React.Key | null | undefined) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{group.range}</span>
                  <span className="font-medium text-gray-900">{group.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Engagement Metrics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Avg Bookings per Customer</span>
                <span className="font-medium">
                  {customerAnalytics.engagement?.avgBookingsPerCustomer?.toFixed(1) || "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Repeat Customers</span>
                <span className="font-medium">
                  {(customerAnalytics.engagement?.repeatCustomers || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Churn Rate</span>
                <span className="font-medium text-red-600">
                  {customerAnalytics.engagement?.churnRate?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BookingsChart: React.FC<ChartProps> = ({ bookingsChartData, showBookingsGraph, setShowBookingsGraph }) => (
  <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-900">Weekly Booking Patterns</h3>
      <p className="text-sm text-gray-600">Daily booking volume and completion rates</p>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={bookingsChartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend />
        <Bar dataKey="completed" fill="#10B981" name="Completed" />
        <Bar dataKey="cancelled" fill="#EF4444" name="Cancelled" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const ServiceTypePieChart: React.FC<ChartProps> = ({ serviceTypePieData, showServiceTypeGraph, setShowServiceTypeGraph }) => (
  <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-900">Service Revenue Distribution</h3>
      <p className="text-sm text-gray-600">Revenue breakdown by service category</p>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={serviceTypePieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {serviceTypePieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);