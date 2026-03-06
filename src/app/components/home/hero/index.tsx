"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { getImgPath, getDataPath } from "@/utils/pathUtils";
import Link from "next/link";

const Hero = () => {
 

  return (
    <section className="relative pt-44 pb-0 dark:bg-darklight bg-no-repeat bg-gradient-to-b from-white from-10% dark:from-darkmode to-herobg to-90% dark:to-darklight overflow-x-hidden">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md relative z-10">
        <div className="grid lg:grid-cols-12 grid-cols-1">
          <div
            className="flex flex-col col-span-6 justify-center items-start"
            data-aos="fade-right"
          >
            <div className="mb-8">
              <h1 className="md:text-[50px] leading-[1.2] text-4xl  ml-4 text-midnight_text dark:text-white font-bold">
                Sharp your skills with <br />
                SkillMENTOR
              </h1>
            </div>
            <div className="max-w-xl ml-4 sm:w-full">
              <p className="text-3xl text-midnight_text dark:text-white mb-8 font-bold">
                Sri Lanka's best <br />
                Soft Skill Enhancement Plateform
              </p>
              <p className="mb-8 pb-2 text-gray">
                We evaluate students’ current soft skill levels using
                phase-specific surveys, scenario-based quizzes, speech analysis
                via Artificial Intelligence and provide a personalized
                recommendations for skill improvement, including curated
                resources (e.g., online courses, local workshops) and adaptive
                tasks, delivered via a recommendation engine tailored to
                individual profiles and socio economic contexts.
              </p>
              <Link
                href="#"
                className="text-xl px-9 py-3 border border-primary text-primary hover:text-white hover:bg-primary rounded-lg"
              >
                More Details
              </Link>
            </div>
            <div className="flex flex-col justify-start ml-4 mt-8 mb-12 gap-3">
              <div className="flex space-x-2" data-aos="fade-left">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .587l3.668 7.431L24 9.763l-6 5.847L19.336 24 12 20.019 4.664 24 6 15.61 0 9.763l8.332-1.745z" />
                </svg>
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .587l3.668 7.431L24 9.763l-6 5.847L19.336 24 12 20.019 4.664 24 6 15.61 0 9.763l8.332-1.745z" />
                </svg>
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .587l3.668 7.431L24 9.763l-6 5.847L19.336 24 12 20.019 4.664 24 6 15.61 0 9.763l8.332-1.745z" />
                </svg>
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .587l3.668 7.431L24 9.763l-6 5.847L19.336 24 12 20.019 4.664 24 6 15.61 0 9.763l8.332-1.745z" />
                </svg>
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .587l3.668 7.431L24 9.763l-6 5.847L19.336 24 12 20.019 4.664 24 6 15.61 0 9.763l8.332-1.745z" />
                </svg>
              </div>
              <div data-aos="fade-left">
                <p className="text-lg dark:text-white text-black">
                  4.9/5
                  <span className="text-gray-400"> - from 658 reviews</span>
                </p>
              </div>
            </div>
          </div>
          <div className="lg:block hidden col-span-6 absolute xl:-right-60 right-0 bottom-0 -z-1">
            <Image
              src={getImgPath("/images/hero/hero-image.png")}
              alt="heroimage"
              width={800}
              height={0}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
