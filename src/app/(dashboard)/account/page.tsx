"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getAccount, updateAccount } from "@/services/userApi";
import { QUERY_KEYS } from "@/lib/queryKeys";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconLoader2,
  IconUser,
  IconMail,
  IconShield,
  IconCheck,
} from "@tabler/icons-react";

// Constants
const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 4000,
} as const;

// Zod schema for form validation
const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// API functions - moved outside component to prevent recreation
const fetchUserProfile = async () => {
  return await getAccount();
};

const updateUserProfile = async (data: UpdateProfileFormData) => {
  return { user: await updateAccount({ fullName: data.fullName }) };
};

// Custom hooks for better separation of concerns
const useUserProfile = (enabled: boolean) => {
  return useQuery({
    queryKey: QUERY_KEYS.userProfile,
    queryFn: fetchUserProfile,
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

const useUpdateProfile = () => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Optimistic update - update user in context immediately
      if (user) {
        setUser({ ...user, fullName: data.user.fullName });
      }

      // Update cache directly instead of invalidating (more efficient)
      queryClient.setQueryData(QUERY_KEYS.userProfile, (oldData: any) => ({
        ...oldData,
        fullName: data.user.fullName,
      }));

      toast.success("Profile updated successfully!", {
        description: "Your changes have been saved.",
        duration: TOAST_DURATION.SUCCESS,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to update profile";
      toast.error("Update failed", {
        description: errorMessage,
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

// Utility function with memoization
const getInitials = (name: string, email: string): string => {
  if (name?.trim()) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
};

// Loading component for better UX
const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen">
    <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

// Error component for better UX
const ErrorState = ({
  error,
  onRetry,
}: {
  error: any;
  onRetry?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold text-destructive">
        Failed to load profile
      </h3>
      <p className="text-sm text-muted-foreground">
        {error?.message ||
          "Something went wrong while loading your profile information."}
      </p>
    </div>
    {onRetry && (
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    )}
  </div>
);

// Profile header component for better component composition
const ProfileHeader = ({
  profileData,
  isLoading,
  userEmail,
}: {
  profileData: any;
  isLoading: boolean;
  userEmail: string;
}) => {
  const initials = useMemo(
    () =>
      getInitials(profileData?.fullName || "", profileData?.email || userEmail),
    [profileData?.fullName, profileData?.email, userEmail]
  );

  return (
    <div className="flex items-center gap-6 rounded-lg bg-muted/50 p-6">
      <Avatar className="h-20 w-20 ring-2 ring-background shadow-md">
        <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
          {isLoading ? (
            <IconLoader2 className="h-6 w-6 animate-spin" />
          ) : (
            initials
          )}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold">
              {profileData?.fullName || userEmail.split("@")[0]}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <IconMail className="h-3 w-3" />
              {profileData?.email || userEmail}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default function AccountPage() {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();

  // Use custom hook for profile data
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useUserProfile(!!user);

  // Form setup with react-hook-form and Zod resolver
  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, errors },
  } = form;

  // Memoize form reset to prevent unnecessary re-renders
  const resetForm = useCallback(() => {
    if (profileData?.fullName) {
      setValue("fullName", profileData.fullName, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [profileData?.fullName, setValue]);

  // Set form values when profile data loads
  useEffect(() => {
    resetForm();
  }, [resetForm]);

  // Memoize form submission handler
  const onSubmit = useCallback(
    (data: UpdateProfileFormData) => {
      updateProfileMutation.mutate(data);
    },
    [updateProfileMutation]
  );

  // Early return for unauthenticated users
  if (!user) {
    return <LoadingState />;
  }

  // Handle profile loading error
  if (profileError) {
    return (
      <div className="mx-auto max-w-4xl">
        <ErrorState error={profileError} onRetry={refetchProfile} />
      </div>
    );
  }

  const userEmail = user.email;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile information and account preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <IconUser className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Header */}
              <ProfileHeader
                profileData={profileData}
                isLoading={isLoadingProfile}
                userEmail={userEmail}
              />

              {/* Update Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="Enter your full name"
                    className="h-11"
                    disabled={isLoadingProfile}
                    aria-invalid={!!errors.fullName}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData?.email || userEmail}
                    disabled
                    className="h-11 bg-muted/50"
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <IconShield className="h-3 w-3" />
                    Email cannot be changed for security reasons
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={
                      updateProfileMutation.isPending ||
                      !isDirty ||
                      isLoadingProfile ||
                      !!errors.fullName
                    }
                    className="flex-1 h-11"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <IconCheck className="mr-2 h-4 w-4" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
