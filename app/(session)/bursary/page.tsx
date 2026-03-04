"use client";
import React, { useState } from "react";
import {
  Wallet,
  Receipt,
  History,
  Download,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock financial data
  const financialSummary = {
    totalFees: 4500.0,
    paidAmount: 3200.0,
    balance: 1300.0,
    dueDate: "March 15, 2026",
  };

  const paymentHistory = [
    {
      id: "PAY-99281",
      date: "Feb 12, 2026",
      method: "Credit Card",
      amount: 1200.0,
      status: "Successful",
      type: "Tuition Fee",
    },
    {
      id: "PAY-88210",
      date: "Jan 05, 2026",
      method: "Bank Transfer",
      amount: 1500.0,
      status: "Successful",
      type: "Tuition Fee",
    },
    {
      id: "PAY-77123",
      date: "Dec 15, 2025",
      method: "Online Portal",
      amount: 500.0,
      status: "Successful",
      type: "Registration Fee",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Bursary & Finances
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your tuition payments and billing statements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-sm font-medium">
              <CreditCard size={18} />
              <span>Make a Payment</span>
            </button>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Total Semester Fees
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                ${financialSummary.totalFees.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Total Paid
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                ${financialSummary.paidAmount.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-rose-400"></div>
            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Wallet size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Remaining Balance
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                ${financialSummary.balance.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment History Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="text-emerald-600" size={20} />
                <h2 className="text-xl font-bold text-slate-800">
                  Payment History
                </h2>
              </div>
              <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentHistory.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        {payment.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {payment.type}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {payment.method}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                          <CheckCircle2 size={12} />
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Payment Deadline Alert */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Next Deadline</h3>
                  <p className="text-rose-100 text-sm mt-1">
                    Your balance of <strong>$1,300</strong> is due by{" "}
                    {financialSummary.dueDate}.
                  </p>
                </div>
              </div>
              <button className="mt-5 w-full py-3 bg-white text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                Pay Balance Now
                <ArrowUpRight size={18} />
              </button>
            </div>

            {/* Invoices & Documents */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Receipt className="text-indigo-600" size={20} />
                Billing Documents
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Sem 1 Statement", size: "1.2 MB", date: "Feb 01" },
                  {
                    name: "Fee Structure 2026",
                    size: "450 KB",
                    date: "Jan 15",
                  },
                  {
                    name: "Scholarship Letter",
                    size: "890 KB",
                    date: "Jan 10",
                  },
                ].map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white group-hover:text-indigo-600 text-slate-400 transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          {doc.date} • {doc.size}
                        </p>
                      </div>
                    </div>
                    <Download
                      size={16}
                      className="text-slate-300 group-hover:text-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Support */}
            <div className="bg-slate-800 rounded-3xl p-6 text-white shadow-sm">
              <h3 className="font-bold mb-2">Need Financial Help?</h3>
              <p className="text-slate-400 text-sm mb-4">
                Contact the bursar's office for payment plans or scholarship
                inquiries.
              </p>
              <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-colors">
                Contact Office
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
