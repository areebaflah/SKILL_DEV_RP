import React from "react";
import { Metadata } from "next";
import Recommendation from "@/app/components/recommendation/index";
export const metadata: Metadata = {
  title: "Critical Thinking | Property-pro",
};

const page = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/recommendation", text: "Recommandation" },
  ];
  return (
    <>
      <Recommendation/>
    </>
  );
};

export default page;
