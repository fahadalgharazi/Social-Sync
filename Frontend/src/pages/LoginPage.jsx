import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "../features/auth/api/authApi";
import { loginSchema } from "../validators/auth.validator";

import { Eye, EyeOff, Mail, Lock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  /**
   * LESSON: React Hook Form + Zod Integration
   *
   * useForm() manages form state and validation.
   * - register(): Connects inputs to the form
   * - handleSubmit(): Validates before calling onSubmit
   * - formState: Contains errors, isSubmitting, etc.
   * - zodResolver(): Uses our Zod schema for validation
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  /**
   * This function ONLY runs if validation passes!
   * No need for e.preventDefault() - handleSubmit does it
   */
  async function onSubmit(data) {
    setError("");
    try {
      // Data is already validated and transformed by Zod
      const { error } = await login(data.email, data.password);
      if (error) return setError(error.message || "Login failed");
      nav("/events");
    } catch (err) {
      setError(err?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <Card className="bg-white/70 backdrop-blur-xl border-white/50 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Welcome Back!
              </CardTitle>
              <CardDescription className="text-gray-500">
                Sign in to continue your journey
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className={`pl-10 h-12 border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
                      errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`pl-10 pr-12 h-12 border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
                      errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-1 top-1 h-10 w-10 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-gray-300" />
                  <Label htmlFor="remember" className="text-gray-600 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-indigo-600 hover:text-indigo-500 p-0 h-auto font-medium"
                >
                  Forgot password?
                </Button>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-70"
              >
                {isSubmitting ? "Signing in…" : "Sign In"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or continue with</span>
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="bg-gray-50/50 backdrop-blur-sm border-t border-gray-100">
            <p className="text-center text-sm text-gray-600 w-full">
              Don&apos;t have an account?{" "}
              <Button
                type="button"
                variant="link"
                onClick={() => nav("/signup")}
                className="text-indigo-600 hover:text-indigo-500 p-0 h-auto font-medium"
              >
                Sign up
              </Button>
            </p>
          </CardFooter>
        </Card>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <Button
            variant="link"
            className="text-indigo-600 hover:text-indigo-500 p-0 h-auto text-xs"
          >
            Terms of Service
          </Button>{" "}
          and{" "}
          <Button
            variant="link"
            className="text-indigo-600 hover:text-indigo-500 p-0 h-auto text-xs"
          >
            Privacy Policy
          </Button>
        </p>
      </div>
    </div>
  );
}