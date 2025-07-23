"use client";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { requestOTP, verifyOTP } from "@/services/authApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  GalleryVerticalEnd,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { APP_CONFIG } from "@/lib/constants";
import type { OTPRequest, VerifyOTPData } from "@/types/user.types";

type AuthState = "email" | "otp";

export default function LoginPage() {
  const [authState, setAuthState] = useState<AuthState>("email");
  const [resendSuccess, setResendSuccess] = useState(false);
  const emailRef = useRef<string | null>(null);
  const router = useRouter();
  const { setUser } = useAuth();

  const emailForm = useForm<OTPRequest>();
  const otpForm = useForm<VerifyOTPData>({
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  const emailMutation = useMutation({
    mutationFn: requestOTP,
    onSuccess: (_, data) => {
      emailRef.current = data.email;
      setAuthState("otp");
      emailForm.clearErrors();
    },
    onError: (err: any) => {
      emailForm.setError("root", {
        type: "manual",
        message: err.message || "Failed to send OTP",
      });
    },
  });

  const otpMutation = useMutation({
    mutationFn: verifyOTP,
    onSuccess: (user) => {
      setUser(user);
      otpForm.clearErrors();
      router.push("/dashboard");
    },
    onError: (err: any) => {
      otpForm.setError("otp", {
        type: "manual",
        message: err.message || "Invalid OTP",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: requestOTP,
    onSuccess: () => {
      setResendSuccess(true);
      otpForm.clearErrors();
      setTimeout(() => setResendSuccess(false), 3000);
    },
    onError: (err: any) => {
      otpForm.setError("root", {
        type: "manual",
        message: err.message || "Failed to resend OTP",
      });
    },
  });

  const handleEmailSubmit = useCallback(
    (data: OTPRequest) => {
      emailMutation.mutate(data);
    },
    [emailMutation]
  );

  const handleOtpSubmit = useCallback(
    (data: VerifyOTPData) => {
      otpForm.clearErrors();
      if (!data.otp || data.otp.length !== 6) {
        otpForm.setError("otp", {
          type: "manual",
          message: "Please enter a complete 6-digit OTP",
        });
        return;
      }

      const submitData = {
        email: emailRef.current!,
        otp: data.otp,
      };

      otpMutation.mutate(submitData);
    },
    [otpMutation, otpForm]
  );

  const handleResendOTP = useCallback(() => {
    if (emailRef.current) {
      otpForm.clearErrors();
      resendMutation.mutate({ email: emailRef.current });
    }
  }, [resendMutation, otpForm]);

  const handleBackToEmail = useCallback(() => {
    setAuthState("email");
    emailRef.current = null;
    setResendSuccess(false);
    emailForm.reset();
    otpForm.reset();
    emailMutation.reset();
    otpMutation.reset();
    resendMutation.reset();
  }, [emailForm, otpForm, emailMutation, otpMutation, resendMutation]);

  const handleReset = useCallback(() => {
    setAuthState("email");
    emailRef.current = null;
    setResendSuccess(false);
    emailForm.reset();
    otpForm.reset();
    emailMutation.reset();
    otpMutation.reset();
    resendMutation.reset();
  }, [emailForm, otpForm, emailMutation, otpMutation, resendMutation]);

  const otpValue = otpForm.watch("otp");

  return (
    <div className="grid min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            {APP_CONFIG.name}
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {authState === "email" && (
              <form
                className="flex flex-col gap-6"
                onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Login to your account</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to login to your account
                  </p>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      {...emailForm.register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      disabled={emailMutation.isPending}
                      aria-invalid={!!emailForm.formState.errors.email}
                      className={
                        emailForm.formState.errors.email ? "border-red-500" : ""
                      }
                    />
                    {emailForm.formState.errors.email && (
                      <div className="flex items-center text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {emailForm.formState.errors.email.message}
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={emailMutation.isPending}
                  >
                    {emailMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>Login</>
                    )}
                  </Button>
                  {emailForm.formState.errors.root && (
                    <div className="flex items-start text-red-600 text-sm p-3 bg-red-50 rounded border">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium mb-1">
                          Failed to send email
                        </div>
                        <div>{emailForm.formState.errors.root.message}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            )}
            {authState === "otp" && (
              <form
                className="flex flex-col gap-5 items-center w-full max-w-xs mx-auto"
                onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
                key="otp-form"
              >
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="flex items-center text-sm text-muted-foreground hover:underline mb-2 self-center"
                  tabIndex={-1}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <h1 className="text-2xl font-bold text-center">Verify OTP</h1>
                <p className="text-muted-foreground text-sm text-center mb-2">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-medium">{emailRef.current}</span>
                </p>
                <div className="w-full flex flex-col items-center">
                  <Label className="mb-2 text-center w-full">OTP Code</Label>
                  <InputOTP
                    value={otpValue}
                    onChange={(value) => {
                      if (otpForm.formState.errors.otp) {
                        otpForm.clearErrors("otp");
                      }
                      otpForm.setValue("otp", value);
                    }}
                    maxLength={6}
                    disabled={otpMutation.isPending}
                    aria-invalid={!!otpForm.formState.errors.otp}
                    className="justify-center gap-2 px-2 py-2"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className="w-10 h-12 rounded-lg border border-input shadow-sm text-xl text-center transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none bg-background mx-0.5"
                      />
                      <InputOTPSlot
                        index={1}
                        className="w-10 h-12 rounded-lg border border-input shadow-sm text-xl text-center transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none bg-background mx-0.5"
                      />
                      <InputOTPSlot
                        index={2}
                        className="w-10 h-12 rounded-lg border border-input shadow-sm text-xl text-center transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none bg-background mx-0.5"
                      />
                      <InputOTPSeparator className="mx-1 text-lg font-bold text-muted-foreground select-none" />
                      <InputOTPSlot
                        index={3}
                        className="w-10 h-12 rounded-lg border border-input shadow-sm text-xl text-center transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none bg-background mx-0.5"
                      />
                      <InputOTPSlot
                        index={4}
                        className="w-10 h-12 rounded-lg border border-input shadow-sm text-xl text-center transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none bg-background mx-0.5"
                      />
                      <InputOTPSlot
                        index={5}
                        className="w-10 h-12 rounded-lg border border-input shadow-sm text-xl text-center transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none bg-background mx-0.5"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                  <span className="text-xs text-muted-foreground mt-1 text-center">
                    Didn&apos;t receive the code? Check your spam folder.
                  </span>
                </div>
                {otpForm.formState.errors.otp && (
                  <div className="flex items-center text-xs text-red-500 mt-2">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {otpForm.formState.errors.otp.message}
                  </div>
                )}
                {otpForm.formState.errors.root && (
                  <div className="flex items-center text-xs text-red-500 mt-2">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {otpForm.formState.errors.root.message}
                  </div>
                )}
                {resendSuccess && (
                  <div className="flex items-center text-xs text-green-600 mt-2">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    New OTP sent!
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={otpMutation.isPending}
                >
                  {otpMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
                <div className="flex gap-2 w-full mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleResendOTP}
                    disabled={resendMutation.isPending}
                  >
                    {resendMutation.isPending ? "Resending..." : "Resend OTP"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
