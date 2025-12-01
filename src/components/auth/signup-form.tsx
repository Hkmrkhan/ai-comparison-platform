"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValidLength = password.length >= 8 && password.length <= 20;

    return (
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar &&
      isValidLength
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (firstName.length < 2 || firstName.length > 10) {
      alert("First name must be between 2-10 characters");
      return;
    }

    if (lastName.length < 2 || lastName.length > 10) {
      alert("Last name must be between 2-10 characters");
      return;
    }

    if (!validatePassword(password)) {
      alert(
        "Password must be 8-20 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        alert("Account created successfully!.");
        router.push("/onboarding");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-sm sm:max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-0">
        <div className="p-6 sm:p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
              Create Account
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Join us to start comparing AI models
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* First Name */}
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm sm:text-base font-medium text-gray-700"
              >
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                minLength={2}
                maxLength={10}
                required
                autoComplete="given-name"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">2-10 characters</p>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm sm:text-base font-medium text-gray-700"
              >
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                minLength={2}
                maxLength={10}
                required
                autoComplete="family-name"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">2-10 characters</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm sm:text-base font-medium text-gray-700"
              >
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={30}
                required
                autoComplete="email"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum 30 characters allowed
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm sm:text-base font-medium text-gray-700"
              >
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={20}
                  required
                  autoComplete="new-password"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                8-20 characters: Must include uppercase, lowercase, number, and
                special character
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}