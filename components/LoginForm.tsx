"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { loginUser } from "../services/api";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export const LoginForm = () => {
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    setLoginError(null);
    try {
      await loginUser(data);
      window.location.href = "/";
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials.";

      setLoginError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-primary -z-10 rounded-b-[40%]" />
      <div className="w-full max-w-md shadow-2xl p-8 bg-white rounded-3xl border border-gray-100">
        <div className="flex flex-col gap-4 pb-6 items-center text-center">
          <img
            alt="Logo"
            className="w-16 h-16 object-contain drop-shadow-md"
            src="/android-chrome-512x512.png"
          />
          <div>
            <h2 className="text-3xl font-bold text-primary">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-1">
              Log in to your student dashboard.
            </p>
          </div>
        </div>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
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
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
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

          {loginError && (
            <div className="text-sm font-medium text-secondary bg-secondary/10 p-3 rounded-xl border border-secondary/20 text-center">
              {loginError}
            </div>
          )}

          <button
            className="mt-4 py-3 px-6 rounded-xl font-bold text-white bg-primary shadow-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};
