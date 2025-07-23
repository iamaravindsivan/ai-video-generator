"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { verifyMagicLink } from "@/services/authApi";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Mail,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { APP_CONFIG } from "@/lib/constants";

export default function MagicLinkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuth();
  const token = searchParams.get("token");
  const [verificationComplete, setVerificationComplete] = useState(false);

  const mutation = useMutation({
    mutationFn: verifyMagicLink,
    onSuccess: (user) => {
      setUser(user);
      setVerificationComplete(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    },
    onError: (err: any) => {
      setVerificationComplete(true);
      console.error("Magic link verification error:", err);
    },
  });

  useEffect(() => {
    if (token) {
      mutation.mutate({ token });
    } else {
      setVerificationComplete(true);
    }
  }, [token]);

  // Loading Component
  const LoadingVerification = () => (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative mb-6">
        {/* Outer spinning ring */}
        <div className="w-20 h-20 border-4 border-gray-200 rounded-full animate-spin border-t-primary"></div>
        {/* Inner pulsing circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full animate-pulse flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Animated text */}
      <div className="text-center space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Verifying Magic Link
        </h3>
        <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
          <span>Securing your connection</span>
          <div className="flex space-x-1">
            <div
              className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="mt-8 w-full max-w-xs">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>Validating</span>
          <span>Authenticating</span>
          <span>Redirecting</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full animate-pulse"
            style={{ width: "60%" }}
          ></div>
        </div>
      </div>
    </div>
  );

  // Success Component
  const SuccessVerification = () => (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative mb-6">
        {/* Success circle with checkmark */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        {/* Success ripple effect */}
        <div className="absolute inset-0 w-20 h-20 bg-green-200 rounded-full animate-ping opacity-75"></div>
      </div>

      <div className="text-center space-y-3">
        <h3 className="text-xl font-bold text-green-700">
          Magic Link Verified!
        </h3>
        <p className="text-green-600">You are now logged in</p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mt-4">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>Redirecting to dashboard...</span>
        </div>
      </div>

      {/* Countdown or progress */}
      <div className="mt-6 w-full max-w-xs">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-green-500 h-1.5 rounded-full animate-pulse"
            style={{ width: "100%" }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Mail className="size-4" />
            </div>
            {APP_CONFIG.name}
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Magic Link Verification</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  {mutation.isPending
                    ? "Securely verifying your identity..."
                    : "Processing your login request"}
                </p>
              </div>

              <div className="grid gap-6">
                {mutation.isPending && <LoadingVerification />}

                {mutation.isSuccess && <SuccessVerification />}

                {mutation.isError && (
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                      <AlertCircle className="w-12 h-12 text-red-600" />
                    </div>
                    <div className="text-center space-y-3">
                      <h3 className="text-xl font-bold text-red-700">
                        Verification Failed
                      </h3>
                      <p className="text-red-600 text-sm">
                        {!token
                          ? "No verification token was provided in the URL."
                          : (mutation.error as any)?.message ||
                            "The magic link is invalid or has expired"}
                      </p>
                    </div>
                  </div>
                )}

                {verificationComplete && (
                  <div className="flex flex-col gap-3 mt-4">
                    {mutation.isSuccess ? (
                      <Button
                        className="w-full"
                        onClick={() => router.push("/dashboard")}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    ) : (
                      <>
                        <Button className="w-full" asChild>
                          <Link href="/auth/login">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again with Login
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/auth/signup">
                            <Mail className="w-4 h-4 mr-2" />
                            Create New Account
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
