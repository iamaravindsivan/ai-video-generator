import React from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center">{children}</div>
      <div className="bg-muted relative hidden lg:block w-1/2">
        <Image
          src="/images/placeholder.jpg"
          alt="Placeholder"
          fill
          className="grayscale"
        />
      </div>
    </div>
  );
}
