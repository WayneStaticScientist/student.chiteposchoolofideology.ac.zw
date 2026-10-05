"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Loader2,
  UserCheck,
  CheckCircle2,
  CreditCard,
  Lock,
  Smartphone,
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

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getEnrollmentByNationalId(nationalId);

        setEnrollmentDetails(res.data);
        setValue("nationalId", res.data.nationalId);
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
          await refreshRequirements(res.data.nationalId);
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
  }, [nationalId, refreshRequirements, setValue]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (
      paymentResult?.paymentId &&
      paymentResult.status === "pending" &&
      enrollmentDetails?.nationalId
    ) {
      interval = setInterval(async () => {
        try {
          const res = await checkRegistrationPaymentStatus(
            paymentResult.paymentId,
            enrollmentDetails.nationalId,
          );
          if (res.status === "paid" || res.status === "failed") {
            setPaymentResult((prev) =>
              prev ? { ...prev, status: res.status } : prev,
            );
            if (res.status === "paid") {
              await refreshRequirements(enrollmentDetails.nationalId);
            }
          }
        } catch {
          /* keep polling */
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentResult, enrollmentDetails, refreshRequirements]);

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

      setPaymentResult({
        paymentId: res.paymentId,
        status: "pending",
        redirectUrl: res.redirectUrl,
        instructions: res.instructions,
      });
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

  return (
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
              {paymentResult?.status === "pending" && (
                <p className="text-xs text-center text-gray-500">
                  {paymentResult.instructions ||
                    "Complete payment in the opened window. We will confirm automatically."}
                </p>
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

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
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
  );
};
