"use client";

import React, { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Select from "react-select";
import "flag-icons/css/flag-icons.min.css";
import countryList from "react-select-country-list";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { submitEnrollment } from "../services/api";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  nationalId: z.string().min(1, "National ID is required"),
  countryOfResidence: z.string().min(1, "Country is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  city: z.string().min(1, "City is required"),
  birthCity: z.string().min(1, "Birth city is required"),
});

type FormData = z.infer<typeof schema>;

export const EnrollmentForm = () => {
  const router = useRouter();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
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
      countryOfResidence: "",
      phoneNumber: "",
      email: "",
      city: "",
      birthCity: "",
    },
  });

  const options = useMemo(() => {
    const list = countryList().getData();

    return list.map((country) => ({
      value: country.label,
      label: (
        <div className="flex items-center gap-2 text-gray-900">
          <span className={`fi fi-${country.value.toLowerCase()}`} />
          {country.label}
        </div>
      ),
    }));
  }, []);

  const selectCustomStyles = useMemo(
    () => ({
      control: (base: any, state: any) => ({
        ...base,
        borderRadius: "0.75rem",
        padding: "3px 4px",
        borderColor: errors.countryOfResidence
          ? "#FF0000"
          : state.isFocused
            ? "#008A2E"
            : "#D1D5DB",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(0, 138, 46, 0.2)" : "none",
        backgroundColor: "#FFFFFF",
        "&:hover": {
          borderColor: "#008A2E",
        },
      }),
      singleValue: (base: any) => ({
        ...base,
        color: "#111827",
      }),
      input: (base: any) => ({
        ...base,
        color: "#111827",
      }),
      placeholder: (base: any) => ({
        ...base,
        color: "#9CA3AF",
      }),
      menu: (base: any) => ({
        ...base,
        backgroundColor: "#FFFFFF",
        borderRadius: "0.75rem",
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        zIndex: 50,
        overflow: "hidden",
      }),
      option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "#008A2E"
          : state.isFocused
            ? "#F3F4F6"
            : "#FFFFFF",
        color: state.isSelected ? "#FFFFFF" : "#111827",
        cursor: "pointer",
        "&:active": {
          backgroundColor: "#008A2E",
          color: "#FFFFFF",
        },
      }),
    }),
    [errors.countryOfResidence],
  );

  const onSubmit = async (data: FormData) => {
    try {
      await submitEnrollment(data);
      setShowSuccessDialog(true);
      reset();
    } catch (error: unknown) {
      console.error(error);
      const axiosErr = error as { response?: { data?: { error?: string } } };
      alert(
        axiosErr.response?.data?.error || "Failed to submit enrollment.",
      );
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto shadow-2xl p-8 bg-white rounded-3xl border border-gray-100">
        <div className="flex flex-col gap-4 pb-6 items-center text-center">
          <img
            alt="Logo"
            className="w-20 h-20 object-contain drop-shadow-md"
            src="/android-chrome-512x512.png"
          />
          <div>
            <h2 className="text-3xl font-bold text-primary">
              Student Enrollment
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Please fill out the form below to enroll.
            </p>
          </div>
        </div>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
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
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium text-gray-700">
                Last Name
              </label>
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <input
                    {...field}
                    className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.lastName ? "border-secondary" : "border-gray-300"}`}
                    placeholder="e.g. Moyo"
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
                  placeholder="e.g. 63-1234567-X-00"
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

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 font-medium">
              Country of Residence
            </label>
            <Controller
              control={control}
              name="countryOfResidence"
              render={({ field }) => (
                <Select
                  options={options}
                  placeholder="Select your country..."
                  styles={selectCustomStyles}
                  value={options.find((c) => c.value === field.value) || null}
                  onChange={(selected: any) =>
                    field.onChange(selected?.value || "")
                  }
                />
              )}
            />
            {errors.countryOfResidence && (
              <p className="text-xs text-secondary">
                {errors.countryOfResidence.message}
              </p>
            )}
          </div>

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
                  type="email"
                  autoComplete="email"
                  className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.email ? "border-secondary" : "border-gray-300"}`}
                  placeholder="name@example.com"
                  value={field.value ?? ""}
                />
              )}
            />
            {errors.email && (
              <span className="text-xs text-secondary">
                {errors.email.message}
              </span>
            )}
            <p className="text-xs text-gray-500">
              Use this same email when you complete registration after acceptance.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 font-medium">
              Phone Number
            </label>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <div
                  className={`w-full flex items-center border rounded-xl px-4 py-2.5 bg-white transition-all ${
                    errors.phoneNumber
                      ? "border-secondary"
                      : "border-gray-300 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
                  }`}
                >
                  <PhoneInput
                    international
                    className="w-full flex items-center"
                    defaultCountry="ZW"
                    value={field.value || ""}
                    onChange={(value) => field.onChange(value || "")}
                  />
                </div>
              )}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-secondary">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium text-gray-700">
                City of Residence
              </label>
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <input
                    {...field}
                    className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.city ? "border-secondary" : "border-gray-300"}`}
                    placeholder="e.g. Harare"
                    value={field.value ?? ""}
                  />
                )}
              />
              {errors.city && (
                <span className="text-xs text-secondary">
                  {errors.city.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium text-gray-700">
                City of Birth
              </label>
              <Controller
                control={control}
                name="birthCity"
                render={({ field }) => (
                  <input
                    {...field}
                    className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.birthCity ? "border-secondary" : "border-gray-300"}`}
                    placeholder="e.g. Bulawayo"
                    value={field.value ?? ""}
                  />
                )}
              />
              {errors.birthCity && (
                <span className="text-xs text-secondary">
                  {errors.birthCity.message}
                </span>
              )}
            </div>
          </div>

          <button
            className="mt-4 py-3 px-6 rounded-xl font-bold text-white bg-primary shadow-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>

      {showSuccessDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Application Submitted!
            </h3>
            <p className="text-gray-500 mb-8">
              Your enrollment application has been successfully submitted. You
              can now check your application status.
            </p>
            <button
              className="w-full py-3 px-6 rounded-xl font-bold text-white bg-primary shadow-lg hover:bg-primary/90 transition-colors"
              onClick={() => router.push("/status")}
            >
              Check Status
            </button>
          </div>
        </div>
      )}
    </>
  );
};
