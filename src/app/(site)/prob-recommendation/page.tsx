import React from "react";
import { Metadata } from "next";
import ProbRecomm from "@/app/components/prob-recomm/index";
export const metadata: Metadata = {
  title: "Results of Evaluation",
};

const page = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/recommendation", text: "Recommandation" },
  ];
  return (
    <>
      <ProbRecomm/>
    </>
  );
};

export default page;
