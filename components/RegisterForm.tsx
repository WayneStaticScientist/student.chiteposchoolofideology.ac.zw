"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2, UserCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { registerUser, getEnrollmentByNationalId } from "../services/api";

const schema = z.object({
  nationalId: z.string().min(1, "National ID is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export const RegisterForm = ({ nationalId }: { nationalId: string }) => {
  const router = useRouter();
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [enrollmentDetails, setEnrollmentDetails] = useState<any>(null);
  const [fetchError, setFetchError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getEnrollmentByNationalId(nationalId);

        setEnrollmentDetails(res.data);
        setValue("nationalId", res.data.nationalId);

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
        }
      } catch (err: any) {
        setFetchError("Could not find enrollment for this National ID.");
      } finally {
        setLoadingDetails(false);
      }
    };

    if (nationalId) {
      fetchDetails();
    }
  }, [nationalId, setValue]);

  const onSubmit = async (data: FormData) => {
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
          <button className="w-full py-3 px-6 rounded-xl font-bold text-white bg-primary shadow-lg hover:bg-primary/90 transition-colors">
            Check Status Instead
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md shadow-2xl p-8 bg-white rounded-3xl border border-gray-100 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col gap-4 pb-4 items-center text-center">
        <img
          alt="Logo"
          className="w-16 h-16 object-contain drop-shadow-md"
          src="/android-chrome-512x512.png"
        />
        <div>
          <h2 className="text-3xl font-bold text-primary">
            Final Registration
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Create your login credentials
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-50 rounded-xl p-4 my-4 border border-gray-100 mb-6">
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

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <input
                {...field}
                className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.email ? "border-secondary" : "border-gray-300"}`}
                placeholder="name@example.com"
                type="email"
                value={field.value ?? ""}
              />
            )}
          />
          {errors.email && (
            <span className="text-xs text-secondary">
              {errors.email.message}
            </span>
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
                className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.password ? "border-secondary" : "border-gray-300"}`}
                placeholder="••••••••"
                type="password"
                value={field.value ?? ""}
              />
            )}
          />
          {errors.password && (
            <span className="text-xs text-secondary">
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          className="mt-2 py-3 px-6 rounded-xl font-bold text-white bg-primary shadow-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Registering..." : "Complete Registration"}
        </button>
      </form>
    </div>
  );
};
