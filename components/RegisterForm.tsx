"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  UserCheck,
  CheckCircle2,
  CreditCard,
  Lock,
  Smartphone,
  X,
} from "lucide-react";
import Link from "next/link";

import {
  registerUser,
  getEnrollmentByNationalId,
  getRegistrationRequirements,
  initiateRegistrationPayment,
  checkRegistrationPaymentStatus,
} from "../services/api";

const schema = z.object({
  nationalId: z.string().min(1, "National ID is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const REG_PAYMENT_PENDING_KEY = "chitepo_reg_payment_pending";

type FeeLine = {
  _id: string;
  name: string;
  amount: number;
  currency: string;
  description?: string;
};

type RegistrationRequirements = {
  fees: FeeLine[];
  totalBilled: number;
  totalPaid: number;
  amountDue: number;
  paymentSatisfied: boolean;
  currency: string;
};

export const RegisterForm = ({ nationalId }: { nationalId: string }) => {
  const router = useRouter();
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [enrollmentDetails, setEnrollmentDetails] = useState<any>(null);
  const [requirements, setRequirements] = useState<RegistrationRequirements | null>(
    null,
  );
  const [fetchError, setFetchError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [method, setMethod] = useState<"ecocash" | "onemoney" | "paynow">("paynow");
  const [phone, setPhone] = useState("");
  const [payProcessing, setPayProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    paymentId: string;
    status: string;
    redirectUrl?: string;
    instructions?: string;
  } | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentSuccessVisible, setPaymentSuccessVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nationalId: "",
      email: "",
      password: "",
    },
  });

  const refreshRequirements = useCallback(async (id: string) => {
    const reqRes = await getRegistrationRequirements(id);
    setRequirements(reqRes.data);
    return reqRes.data as RegistrationRequirements;
  }, []);

  const markPaymentSuccess = useCallback(() => {
    try {
      sessionStorage.removeItem(REG_PAYMENT_PENDING_KEY);
    } catch {
      /* ignore */
    }
    setPaymentResult(null);
    setPaymentModalOpen(true);
    setPaymentSuccessVisible(true);
  }, []);

  const closePaymentSuccess = useCallback(() => {
    setPaymentSuccessVisible(false);
    setPaymentModalOpen(false);
    requestAnimationFrame(() => {
      document.getElementById("registration-account-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const pollPaymentStatus = useCallback(async () => {
    if (
      !paymentResult?.paymentId ||
      paymentResult.status !== "pending" ||
      !enrollmentDetails?.nationalId
    ) {
      return;
    }

    try {
      const res = await checkRegistrationPaymentStatus(
        paymentResult.paymentId,
        enrollmentDetails.nationalId,
      );
      if (res.status === "paid" || res.status === "failed") {
        if (res.status === "paid") {
          await refreshRequirements(enrollmentDetails.nationalId);
          markPaymentSuccess();
        } else {
          setPaymentResult((prev) =>
            prev ? { ...prev, status: "failed" } : prev,
          );
        }
      }
    } catch {
      /* keep polling */
    }
  }, [
    enrollmentDetails?.nationalId,
    markPaymentSuccess,
    paymentResult,
    refreshRequirements,
  ]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getEnrollmentByNationalId(nationalId);

        setEnrollmentDetails(res.data);
        setValue("nationalId", res.data.nationalId);
        if (res.data.email) {
          setValue("email", res.data.email);
        }
        setPhone(res.data.phoneNumber ?? "");

        if (res.data.status !== "accepted") {
          if (res.data.status === "registered") {
            setFetchError(
              "This enrollment is already registered. Please login.",
            );
          } else {
            setFetchError(
              `Enrollment is not accepted yet. Current status: ${res.data.status}`,
            );
          }
          return;
        }

        try {
          const req = await refreshRequirements(res.data.nationalId);
          try {
            const hadPending = sessionStorage.getItem(REG_PAYMENT_PENDING_KEY);
            if (hadPending && req.paymentSatisfied) {
              markPaymentSuccess();
            }
          } catch {
            /* ignore storage */
          }
        } catch {
          setFetchError("Could not load registration fee requirements.");
          return;
        }
      } catch {
        setFetchError("Could not find enrollment for this National ID.");
      } finally {
        setLoadingDetails(false);
      }
    };

    if (nationalId) {
      fetchDetails();
    }
  }, [nationalId, markPaymentSuccess, refreshRequirements, setValue]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (
      paymentResult?.paymentId &&
      paymentResult.status === "pending" &&
      enrollmentDetails?.nationalId
    ) {
      void pollPaymentStatus();
      interval = setInterval(() => {
        void pollPaymentStatus();
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentResult, enrollmentDetails?.nationalId, pollPaymentStatus]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void pollPaymentStatus();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [pollPaymentStatus]);

  const handlePayFees = async () => {
    if (!enrollmentDetails?.nationalId || !requirements) return;
    if ((method === "ecocash" || method === "onemoney") && !phone.trim()) {
      alert("Phone number is required for mobile money payments.");
      return;
    }

    try {
      setPayProcessing(true);
      const res = await initiateRegistrationPayment({
        nationalId: enrollmentDetails.nationalId,
        method,
        phone: method !== "paynow" ? phone : undefined,
      });

      if (res.redirectUrl) {
        window.open(res.redirectUrl, "_blank");
      }

      try {
        sessionStorage.setItem(REG_PAYMENT_PENDING_KEY, res.paymentId);
      } catch {
        /* ignore */
      }

      setPaymentResult({
        paymentId: res.paymentId,
        status: "pending",
        redirectUrl: res.redirectUrl,
        instructions: res.instructions,
      });
      setPaymentModalOpen(true);
      setPaymentSuccessVisible(false);
    } catch (error: any) {
      alert(
        error.response?.data?.error ||
          "Could not start payment. Please try again.",
      );
    } finally {
      setPayProcessing(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (requirements && !requirements.paymentSatisfied) {
      alert("Pay the required registration fees before completing registration.");
      return;
    }

    try {
      await registerUser(data);
      setRegistrationSuccess(true);
    } catch (error: any) {
      console.error(error);
      alert(
        error.response?.data?.error ||
          "Registration failed. Please check your credentials.",
      );
    }
  };

  const paymentSatisfied = requirements?.paymentSatisfied ?? false;
  const amountDue = requirements?.amountDue ?? 0;
  const currency = requirements?.currency ?? "USD";

  if (loadingDetails) {
    return (
      <div className="w-full max-w-md shadow-2xl p-12 bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading details...</p>
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <div className="w-full max-w-md shadow-2xl p-8 bg-white rounded-3xl border border-gray-100 flex flex-col items-center text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Registration Complete!
        </h3>
        <p className="text-gray-500 mb-8">
          You have successfully registered your account. You can now log in
          using your email and password.
        </p>
        <button
          type="button"
          className="w-full py-3 px-6 rounded-xl font-bold text-white bg-primary shadow-lg hover:bg-primary/90 transition-colors"
          onClick={() => router.push("/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (fetchError || !enrollmentDetails) {
    return (
      <div className="w-full max-w-md shadow-2xl p-8 bg-white rounded-3xl border border-gray-100 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-6">
          <UserCheck size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Registration Unavailable
        </h3>
        <p className="text-gray-500 mb-8">{fetchError}</p>
        <Link className="w-full" href="/status">
          <button
            type="button"
            className="w-full py-3 px-6 rounded-xl font-bold text-white bg-primary shadow-lg hover:bg-primary/90 transition-colors"
          >
            Check Status Instead
          </button>
        </Link>
      </div>
    );
  }

  const paymentModalActive =
    paymentModalOpen &&
    (paymentSuccessVisible ||
      paymentResult?.status === "pending" ||
      paymentResult?.status === "failed");

  return (
    <>
      {paymentModalActive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-payment-dialog-title"
          >
            {!paymentSuccessVisible &&
              paymentResult?.status === "pending" && (
                <button
                  type="button"
                  aria-label="Close payment window"
                  className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  onClick={() => {
                    setPaymentModalOpen(false);
                  }}
                >
                  <X size={20} />
                </button>
              )}

            {paymentSuccessVisible ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary animate-in zoom-in duration-500">
                  <CheckCircle2 className="h-10 w-10" strokeWidth={2.25} />
                </div>
                <h2
                  id="registration-payment-dialog-title"
                  className="text-2xl font-bold text-gray-900"
                >
                  Payment successful
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Your registration fees have been received. You can now create
                  your student account below.
                </p>
                <button
                  type="button"
                  className="mt-8 w-full rounded-xl bg-primary py-3.5 px-6 font-bold text-white shadow-lg transition hover:bg-primary/90"
                  onClick={closePaymentSuccess}
                >
                  Continue to register
                </button>
              </div>
            ) : paymentResult?.status === "failed" ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <h2
                  id="registration-payment-dialog-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Payment not completed
                </h2>
                <p className="mt-3 text-sm text-gray-600">
                  The payment was cancelled or failed. You can try again when
                  you&apos;re ready.
                </p>
                <button
                  type="button"
                  className="mt-8 w-full rounded-xl border-2 border-gray-200 py-3 font-bold text-gray-800 hover:bg-gray-50"
                  onClick={() => {
                    setPaymentResult(null);
                    setPaymentModalOpen(false);
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Loader2 className="h-10 w-10 animate-spin" />
                </div>
                <h2
                  id="registration-payment-dialog-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Waiting for payment
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {paymentResult?.instructions ||
                    "Complete payment in the Paynow window. This page will update automatically when payment is confirmed."}
                </p>
                {paymentResult?.redirectUrl && (
                  <a
                    className="mt-4 text-sm font-semibold text-primary underline-offset-2 hover:underline"
                    href={paymentResult.redirectUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Re-open payment page
                  </a>
                )}
                <p className="mt-6 text-xs text-gray-500">
                  Do not close this dialog until you see confirmation, or check
                  back after paying.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    <div className="w-full max-w-lg shadow-2xl p-8 bg-white rounded-3xl border border-gray-100 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col gap-4 pb-4 items-center text-center">
        <img
          alt="Logo"
          className="w-16 h-16 object-contain drop-shadow-md"
          src="/android-chrome-512x512.png"
        />
        <div>
          <h2 className="text-3xl font-bold text-primary">Final Registration</h2>
          <p className="text-sm text-gray-500 mt-1">
            Pay required fees, then create your login credentials
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-50 rounded-xl p-4 my-4 border border-gray-100">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
          Applicant Details
        </p>
        <p className="font-bold text-gray-900">
          {enrollmentDetails.firstName} {enrollmentDetails.lastName}
        </p>
        <p className="text-sm text-gray-600">{enrollmentDetails.phoneNumber}</p>
        {enrollmentDetails.email && (
          <p className="text-sm text-gray-600">{enrollmentDetails.email}</p>
        )}
        <p className="text-sm font-medium text-primary mt-2">
          ID: {enrollmentDetails.nationalId}
        </p>
      </div>

      {requirements && requirements.totalBilled > 0 && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-primary font-bold mb-3">
            <CreditCard size={20} />
            Registration fees ({currency})
          </div>
          <ul className="space-y-2 mb-4">
            {requirements.fees.map((fee) => (
              <li
                key={fee._id}
                className="flex justify-between text-sm text-gray-700"
              >
                <span>{fee.name}</span>
                <span className="font-semibold">
                  {fee.currency} {fee.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-primary/15 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total required</span>
              <span className="font-semibold">
                {currency} {requirements.totalBilled.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Paid so far</span>
              <span className="font-semibold text-primary">
                {currency} {requirements.totalPaid.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900">
              <span>Amount due</span>
              <span>{currency} {amountDue.toFixed(2)}</span>
            </div>
          </div>

          {!paymentSatisfied && (
            <div className="mt-4 space-y-3">
              <p className="text-xs text-gray-600">
                You must pay the full amount due before you can complete registration.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["paynow", "ecocash", "onemoney"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`rounded-lg py-2 text-xs font-bold uppercase ${
                      method === m
                        ? "bg-primary text-white"
                        : "bg-white border border-gray-200 text-gray-600"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {(method === "ecocash" || method === "onemoney") && (
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                  <Smartphone size={18} className="text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Mobile money number"
                    className="w-full text-sm outline-none"
                  />
                </div>
              )}
              <button
                type="button"
                disabled={payProcessing}
                onClick={handlePayFees}
                className="w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-60"
              >
                {payProcessing
                  ? "Starting payment…"
                  : `Pay ${currency} ${amountDue.toFixed(2)}`}
              </button>
              {paymentResult?.status === "pending" && !paymentModalOpen && (
                <button
                  type="button"
                  className="w-full text-xs font-semibold text-primary underline-offset-2 hover:underline"
                  onClick={() => setPaymentModalOpen(true)}
                >
                  View payment status
                </button>
              )}
              {paymentResult?.status === "failed" && (
                <p className="text-xs text-center text-secondary font-medium">
                  Payment failed or was cancelled. Try again.
                </p>
              )}
            </div>
          )}

          {paymentSatisfied && (
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
              <CheckCircle2 size={18} />
              Registration fees paid — you can create your account below.
            </p>
          )}
        </div>
      )}

      <form
        id="registration-account-form"
        className="flex flex-col gap-5 scroll-mt-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {!paymentSatisfied && requirements && requirements.totalBilled > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Lock size={18} />
            Complete payment above to unlock account registration.
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <input
                {...field}
                disabled={!paymentSatisfied && (requirements?.totalBilled ?? 0) > 0}
                className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:bg-gray-100 disabled:text-gray-500 ${errors.email ? "border-secondary" : "border-gray-300"}`}
                placeholder="name@example.com"
                type="email"
                value={field.value ?? ""}
              />
            )}
          />
          {errors.email && (
            <span className="text-xs text-secondary">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <input
                {...field}
                disabled={!paymentSatisfied && (requirements?.totalBilled ?? 0) > 0}
                className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:bg-gray-100 disabled:text-gray-500 ${errors.password ? "border-secondary" : "border-gray-300"}`}
                placeholder="••••••••"
                type="password"
                value={field.value ?? ""}
              />
            )}
          />
          {errors.password && (
            <span className="text-xs text-secondary">{errors.password.message}</span>
          )}
        </div>

        <button
          className="mt-2 py-3 px-6 rounded-xl font-bold text-white bg-primary shadow-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          disabled={
            isSubmitting ||
            (!paymentSatisfied && (requirements?.totalBilled ?? 0) > 0)
          }
          type="submit"
        >
          {isSubmitting ? "Registering..." : "Complete Registration"}
        </button>
      </form>
    </div>
    </>
  );
};
