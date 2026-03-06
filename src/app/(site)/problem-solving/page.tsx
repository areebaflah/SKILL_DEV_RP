import React from "react";
import { Metadata } from "next";
import HeroSub from "@/app/components/shared/hero-sub";
import ProbSection from "@/app/components/probSection/index";
export const metadata: Metadata = {
  title: "Critical Thinking | Property-pro",
};

const page = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/critical-thinking", text: "Critical Thinking" },
  ];
  return (
    <>
      <ProbSection/>
    </>
  );
};

export default page;
