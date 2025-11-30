"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

function UpdatePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          setIsValidSession(true);
        } else {
          const accessToken = searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (!setSessionError) {
              setIsValidSession(true);
            }
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsValidSession(true);
        setIsChecking(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

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

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!validatePassword(newPassword)) {
      alert(
        "Password must be 8-20 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      alert("Password updated successfully! Please sign in with your new password.");
      router.push("/auth/login");
    } catch (error) {
      console.error("Password reset error:", error);
      alert(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-sm sm:max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <div className="p-6 sm:p-8 md:p-10 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-sm sm:text-base text-gray-600">
              Verifying reset link...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-sm sm:max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <div className="p-6 sm:p-8 md:p-10 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
              Invalid Reset Link
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button
              onClick={() => router.push("/auth/reset-password")}
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Request New Link
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-sm sm:max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-0">
        <div className="p-6 sm:p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
              Reset Password
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-sm sm:text-base font-medium text-gray-700"
              >
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                maxLength={20}
                required
                autoComplete="new-password"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                8-20 characters: Must include uppercase, lowercase, number, and
                special character
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm sm:text-base font-medium text-gray-700"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                maxLength={20}
                required
                autoComplete="new-password"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Re-enter your password to confirm
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center pt-4 sm:pt-6 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <Card className="w-full max-w-sm sm:max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-0">
            <div className="p-6 sm:p-8 md:p-10 text-center">
              <div className="text-4xl mb-4">🔄</div>
              <p className="text-sm sm:text-base text-gray-600">Loading...</p>
            </div>
          </Card>
        </div>
      }
    >
      <UpdatePasswordForm />
    </Suspense>
  );
}