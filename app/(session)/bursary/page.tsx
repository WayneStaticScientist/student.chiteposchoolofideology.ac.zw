"use client";
import React, { useState, useEffect } from "react";
import {
  Wallet,
  Receipt,
  History,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Smartphone,
  Globe,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  getPaymentHistory,
  initiatePayment,
  checkPaymentStatus,
} from "@/services/api";

export default function BursaryPage() {
  const [financials, setFinancials] = useState({
    totalBilled: 0,
    totalPaid: 0,
  });
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [method, setMethod] = useState<"ecocash" | "onemoney" | "paynow">(
    "paynow",
  );
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const fetchFinancials = async () => {
    try {
      setIsLoading(true);
      const res = await getPaymentHistory();

      setFinancials(res.financials);
      setHistory(res.history);
    } catch (error) {
      toast.error("Failed to load financial data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  // Polling for payment status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      paymentResult?.paymentId &&
      paymentResult?.status !== "paid" &&
      paymentResult?.status !== "failed"
    ) {
      interval = setInterval(async () => {
        try {
          const res = await checkPaymentStatus(paymentResult.paymentId);

          if (res.status === "paid" || res.status === "failed") {
            setPaymentResult((prev: any) => ({ ...prev, status: res.status }));
            clearInterval(interval);
            if (res.status === "paid") {
              toast.success("Payment Successful!");
              setIsPaymentModalOpen(false);
              fetchFinancials();
            } else {
              toast.error("Payment Failed or Cancelled.");
            }
          }
        } catch (error) {
          console.error(error);
        }
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [paymentResult]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if ((method === "ecocash" || method === "onemoney") && !phone) {
      return toast.error("Phone number is required for mobile payments");
    }

    try {
      setIsProcessing(true);
      const res = await initiatePayment({
        amount: Number(amount),
        method,
        phone: method !== "paynow" ? phone : undefined,
      });

      if (res.redirectUrl) {
        // Redirect to Paynow Web
        window.open(res.redirectUrl, "_blank");
      }

      setPaymentResult({
        ...res,
        status: "pending",
      });
      toast.success("Payment initiated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-slate-50">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
      </div>
    );
  }

  const balance = Math.max(0, financials.totalBilled - financials.totalPaid);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50/50 h-full pb-32 relative">
      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <button
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              onClick={() => {
                setIsPaymentModalOpen(false);
                setPaymentResult(null);
                setAmount("");
              }}
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CreditCard className="text-emerald-500" /> Make a Payment
            </h2>

            {paymentResult ? (
              <div className="text-center space-y-4">
                {paymentResult.status === "pending" && (
                  <>
                    <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4">
                      <Loader2 className="animate-spin" size={30} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Awaiting Payment
                    </h3>
                    {paymentResult.instructions ? (
                      <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {paymentResult.instructions}
                      </p>
                    ) : (
                      <p className="text-slate-500 text-sm">
                        Please complete the payment in the new window. We are
                        checking the status automatically...
                      </p>
                    )}
                  </>
                )}
                {paymentResult.status === "paid" && (
                  <>
                    <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={30} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Payment Successful!
                    </h3>
                  </>
                )}
                {paymentResult.status === "failed" && (
                  <>
                    <div className="mx-auto w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle size={30} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Payment Failed
                    </h3>
                    <p className="text-slate-500 text-sm">Please try again.</p>
                  </>
                )}
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handlePaymentSubmit}>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Amount (ZWG / USD equivalent)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-bold">$</span>
                    </div>
                    <input
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-semibold"
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`cursor-pointer border p-3 rounded-xl flex items-center gap-2 transition-all ${
                        method === "paynow"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <input
                        checked={method === "paynow"}
                        className="hidden"
                        name="method"
                        type="radio"
                        value="paynow"
                        onChange={() => setMethod("paynow")}
                      />
                      <Globe size={18} />
                      <span className="font-bold text-sm">
                        Visa / Innbucks / Mastercard
                      </span>
                    </label>
                    <label
                      className={`cursor-pointer border p-3 rounded-xl flex items-center gap-2 transition-all ${
                        method === "ecocash"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <input
                        checked={method === "ecocash"}
                        className="hidden"
                        name="method"
                        type="radio"
                        value="ecocash"
                        onChange={() => setMethod("ecocash")}
                      />
                      <Smartphone size={18} />
                      <span className="font-bold text-sm">EcoCash</span>
                    </label>
                    <label
                      className={`cursor-pointer border p-3 rounded-xl flex items-center gap-2 transition-all ${
                        method === "onemoney"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <input
                        checked={method === "onemoney"}
                        className="hidden"
                        name="method"
                        type="radio"
                        value="onemoney"
                        onChange={() => setMethod("onemoney")}
                      />
                      <Smartphone size={18} />
                      <span className="font-bold text-sm">OneMoney</span>
                    </label>
                  </div>
                </div>

                {method !== "paynow" && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-semibold"
                      placeholder="077XXXXXXX"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                )}

                <button
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/30 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                  disabled={isProcessing}
                  type="submit"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    "Initiate Payment"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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
            <button
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-sm font-medium"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <CreditCard size={18} />
              <span>Make a Payment</span>
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
                Total Billed
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                ${financials.totalBilled.toLocaleString()}
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
                ${financials.totalPaid.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-rose-400" />
            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Wallet size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Remaining Balance
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                ${balance.toLocaleString()}
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 ? (
                    <tr>
                      <td
                        className="px-6 py-10 text-center text-slate-500"
                        colSpan={4}
                      >
                        No payments found.
                      </td>
                    </tr>
                  ) : (
                    history.map((payment) => (
                      <tr
                        key={payment._id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                          {payment.reference}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                          ${payment.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              payment.status === "paid"
                                ? "bg-emerald-100 text-emerald-700"
                                : payment.status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {payment.status === "paid" && (
                              <CheckCircle2 size={12} />
                            )}
                            {payment.status === "pending" && (
                              <Loader2 className="animate-spin" size={12} />
                            )}
                            {payment.status === "failed" && (
                              <AlertCircle size={12} />
                            )}
                            {payment.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Payment Deadline Alert */}
            {balance > 0 && (
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Outstanding Balance</h3>
                    <p className="text-rose-100 text-sm mt-1">
                      Your balance of{" "}
                      <strong>${balance.toLocaleString()}</strong> needs to be
                      settled to avoid service disruptions.
                    </p>
                  </div>
                </div>
                <button
                  className="mt-5 w-full py-3 bg-white text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  Pay Balance Now
                  <ArrowUpRight size={18} />
                </button>
              </div>
            )}

            {/* Invoices & Documents */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Receipt className="text-indigo-600" size={20} />
                Billing Documents
              </h3>
              <div className="space-y-3">
                <div className="p-4 text-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No billing documents available yet.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
