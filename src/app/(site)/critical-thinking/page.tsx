import React from "react";
import { Metadata } from "next";
import HeroSub from "@/app/components/shared/hero-sub";
import ProblemSection from "@/app/components/prolemSection/index";
export const metadata: Metadata = {
  title: "Critical Thinking ",
};

const page = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/critical-thinking", text: "Critical Thinking" },
  ];
  return (
    <>
      <ProblemSection/>
    </>
  );
};

export default page;
