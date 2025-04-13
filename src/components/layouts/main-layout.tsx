import { Header } from "@/components/common/header";
import React from "react";

export interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-svh">
      <Header />
      {children}
    </div>
  );
}
