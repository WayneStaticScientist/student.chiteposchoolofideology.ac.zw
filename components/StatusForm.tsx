"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";

import { checkEnrollmentStatus } from "../services/api";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  nationalId: z.string().min(1, "National ID is required"),
});

type FormData = z.infer<typeof schema>;

export const StatusForm = () => {
  const [statusResult, setStatusResult] = useState<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      nationalId: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await checkEnrollmentStatus(data);

      setStatusResult(response.data);
    } catch (error: any) {
      console.error(error);
      alert(
        error.response?.data?.error ||
          "Failed to check status. Please check your details.",
      );
    }
  };

  if (statusResult) {
    const getStatusInfo = (status: string) => {
      switch (status) {
        case "accepted":
          return {
            icon: <CheckCircle2 className="w-16 h-16 text-primary mb-4" />,
            title: "Application Accepted!",
            description: "Congratulations! Your enrollment has been accepted.",
            color: "text-primary",
            bg: "bg-primary/10",
            action: (
              <Link
                className="w-full"
                href={`/register/${statusResult.nationalId}`}
              >
                <button className="w-full py-3 px-6 rounded-xl font-bold text-white bg-primary shadow-lg hover:bg-primary/90 transition-colors mt-6">
                  Proceed to Register
                </button>
              </Link>
            ),
          };
        case "rejected":
          return {
            icon: <XCircle className="w-16 h-16 text-secondary mb-4" />,
            title: "Application Rejected",
            description:
              "Unfortunately, your enrollment application has not been approved.",
            color: "text-secondary",
            bg: "bg-secondary/10",
            action: null,
          };
        default:
          return {
            icon: <Clock className="w-16 h-16 text-orange-500 mb-4" />,
            title: "Application Pending",
            description:
              "Your enrollment application is currently under review.",
            color: "text-orange-500",
            bg: "bg-orange-100",
            action: null,
          };
      }
    };

    const statusInfo = getStatusInfo(statusResult.status);

    return (
      <div className="w-full max-w-md mx-auto shadow-2xl p-8 bg-white rounded-3xl border border-gray-100 flex flex-col items-center text-center animate-in fade-in duration-300">
        <div className={`p-4 rounded-full ${statusInfo.bg} mb-4`}>
          {statusInfo.icon}
        </div>
        <h3 className={`text-2xl font-bold mb-2 ${statusInfo.color}`}>
          {statusInfo.title}
        </h3>

        <div className="w-full bg-gray-50 rounded-xl p-4 my-4 text-left border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Applicant Name</p>
          <p className="font-semibold text-gray-900 mb-3">
            {statusResult.firstName} {statusResult.lastName}
          </p>

          <p className="text-sm text-gray-500 mb-1">National ID</p>
          <p className="font-semibold text-gray-900">
            {statusResult.nationalId}
          </p>
        </div>

        <p className="text-gray-600 mb-4">{statusInfo.description}</p>

        {statusInfo.action}

        <button
          className={`w-full py-3 px-6 rounded-xl font-bold text-gray-700 border-2 border-gray-200 hover:bg-gray-50 transition-colors ${statusInfo.action ? "mt-3" : "mt-6"}`}
          onClick={() => {
            setStatusResult(null);
            reset();
          }}
        >
          Check Another Application
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto shadow-2xl p-8 bg-white rounded-3xl border border-gray-100">
      <div className="flex flex-col gap-4 pb-6 items-center text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          <Search size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-primary">Check Status</h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter your details exactly as provided during enrollment.
          </p>
        </div>
      </div>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            First Name
          </label>
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <input
                {...field}
                className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.firstName ? "border-secondary" : "border-gray-300"}`}
                placeholder="e.g. John"
                type="text"
                value={field.value ?? ""}
              />
            )}
          />
          {errors.firstName && (
            <span className="text-xs text-secondary">
              {errors.firstName.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <input
                {...field}
                className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.lastName ? "border-secondary" : "border-gray-300"}`}
                placeholder="e.g. Moyo"
                type="text"
                value={field.value ?? ""}
              />
            )}
          />
          {errors.lastName && (
            <span className="text-xs text-secondary">
              {errors.lastName.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            National ID
          </label>
          <Controller
            control={control}
            name="nationalId"
            render={({ field }) => (
              <input
                {...field}
                className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.nationalId ? "border-secondary" : "border-gray-300"}`}
                placeholder="e.g. 12-345678A99"
                type="text"
                value={field.value ?? ""}
              />
            )}
          />
          {errors.nationalId && (
            <span className="text-xs text-secondary">
              {errors.nationalId.message}
            </span>
          )}
        </div>

        <button
          className="mt-4 py-3 px-6 rounded-xl font-bold text-white bg-primary shadow-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            "Checking..."
          ) : (
            <>
              <Search size={20} /> Check Status
            </>
          )}
        </button>

        <Link className="w-full mt-2" href="/welcome">
          <button
            className="w-full py-3 px-6 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            type="button"
          >
            <ArrowLeft size={20} /> Back to Home
          </button>
        </Link>
      </form>
    </div>
  );
};
