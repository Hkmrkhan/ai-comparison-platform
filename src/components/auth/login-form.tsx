"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        router.push("/compare");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 text-white sm:px-6 md:px-8">
      <div className="absolute inset-0 subtle-grid opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_28%)]" />

      <Card className="relative w-full max-w-md border border-white/10 bg-white/8 shadow-[0_30px_120px_rgba(2,6,23,0.65)] backdrop-blur-2xl">
        <div className="p-6 sm:p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-semibold text-cyan-100">
              AI
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-3">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Sign in to continue to your AI comparison dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm sm:text-base font-medium text-gray-700"
              >
                Email Address
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
                  className="w-full rounded-2xl border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-cyan-400/20"
              />
              <p className="text-xs text-slate-400 mt-1">
                Maximum 30 characters allowed
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm sm:text-base font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-2xl border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 pr-14 text-sm sm:text-base text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-cyan-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                8-20 characters: Must include uppercase, lowercase, number, and
                special character
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-cyan-400 py-3 text-sm sm:text-base font-semibold text-slate-950 shadow-[0_20px_50px_rgba(34,211,238,0.18)] hover:bg-cyan-300 hover:shadow-[0_25px_60px_rgba(34,211,238,0.22)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Forgot Password - Below Sign In Button */}
          <div className="mt-4 text-center">
            <Link
              href="/auth/reset-password"
              className="text-xs sm:text-sm font-medium text-cyan-200 hover:text-cyan-100 hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center pt-4 sm:pt-6 border-t border-white/10">
            <p className="text-xs sm:text-sm text-slate-300">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold text-cyan-200 hover:text-cyan-100 hover:underline transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}