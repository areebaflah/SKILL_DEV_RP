"use client";
import { PropertyContext } from "@/context-api/PropertyContext";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { getDataPath, getImgPath } from "@/utils/pathUtils";

export default function DiscoverProperties() {
  const { properties, updateFilter } = useContext(PropertyContext)!;
  const [propertiesData, setPropertiesData] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(getDataPath("/data/propertydata.json"));
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        const categoryMap: Record<
          string,
          { category: string; category_img: string; count: number }
        > = {};

        data.forEach((item: any) => {
          if (categoryMap[item.category]) {
            categoryMap[item.category].count += 1;
          } else {
            categoryMap[item.category] = {
              category: item.category,
              category_img: item.category_img,
              count: 1,
            };
          }
        });

        const uniqueCategoryData = Object.values(categoryMap);
        setPropertiesData(uniqueCategoryData);
      } catch (error) {
        console.error("Error loading properties:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="dark:bg-darkmode">
      <div className="container lg:max-w-screen-xl md:max-w-screen-md mx-auto px-4">
        <h2
          className="text-4xl font-bold mb-12 text-midnight_text dark:text-white"
          data-aos="fade-left"
        >
          Choose the Skill to Evaluate and Enhance
        </h2>
        <div className="flex gap-8 justify-center">
          <div
            key="1"
            className="bg-white shadow-property dark:bg-darklight rounded-lg overflow-hidden w-fit"
            data-aos="fade-up"
          >
            <Link href="/communication">
              <div className={`relative`}>
                <div className={`imageContainer h-[250px] w-full`}>
                  <Image
                    src={getImgPath("/images/properties/skill1.jpg")}
                    alt={"ComSKill"}
                    width={400}
                    height={250}
                    className="w-full h-full object-cover group-hover:scale-125 duration-500"
                  />
                </div>
                <p className="absolute top-[10px] left-[10px] py-1 px-4 bg-white rounded-md text-primary items-center">
                  Top Skill
                </p>
              </div>
              <div className={`p-5 sm:p-8 dark:text-white text-opacity-50`}>
                <div className="flex flex-col gap-1 border-b border-border dark:border-dark_border mb-6">
                  <div>
                    <p className="text-base text-gray ">Evaluation Test For </p>
                  </div>
                  <div className="flex justify-between items-center pb-4">
                    <div className="font-bold text-2xl group-hover:text-primary text-midnight_text dark:text-white">
                      Communication Skills
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-between">
                  <div className="flex flex-col">
                    <p className="md:text-xl text-lg font-bold flex gap-2">
                      10
                    </p>
                    <p className="text-sm text-gray">Questions</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="md:text-xl text-lg font-bold flex gap-2">
                      15
                    </p>
                    <p className="text-sm text-gray">Min</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="md:text-xl text-lg font-bold flex gap-2">
                      Speaking
                    </p>
                    <p className="text-sm text-gray">Test Type</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Problem Solving Skill start*/}


          <div
            key="2"
            className="bg-white shadow-property dark:bg-darklight rounded-lg overflow-hidden w-fit"
            data-aos="fade-up"
          >
            <Link href="/problem-solving">
              <div className={`relative`}>
                <div className={`imageContainer h-[250px] w-full`}>
                  <Image
                    src={getImgPath("/images/properties/skill2.jpg")}
                    alt={"ComSKill"}
                    width={400}
                    height={250}
                    className="w-full h-full object-cover group-hover:scale-125 duration-500"
                  />
                </div>
                <p className="absolute top-[10px] left-[10px] py-1 px-4 bg-white rounded-md text-primary items-center">
                  Top #2 Skill
                </p>
              </div>
              <div className={`p-5 sm:p-8 dark:text-white text-opacity-50`}>
                <div className="flex flex-col gap-1 border-b border-border dark:border-dark_border mb-6">
                  <div>
                    <p className="text-base text-gray ">Evaluation Test For </p>
                  </div>
                  <div className="flex justify-between items-center pb-4">
                    <div className="font-bold text-2xl group-hover:text-primary text-midnight_text dark:text-white">
                      Problem Solving Skill
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-between">
                  <div className="flex flex-col">
                    <p className="md:text-xl text-lg font-bold flex gap-2">
                      20
                    </p>
                    <p className="text-sm text-gray">Questions</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="md:text-xl text-lg font-bold flex gap-2">
                      15
                    </p>
                    <p className="text-sm text-gray">Min</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="md:text-xl text-lg font-bold flex gap-2">
                      Choice
                    </p>
                    <p className="text-sm text-gray">Test Type</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Critical Thinking Skill start*/}
          <div
            key="3"
            className="bg-white shadow-property dark:bg-darklight rounded-lg overflow-hidden w-fit"
            data-aos="fade-up"
          >
            <Link href="critical-thinking">
              <div className={`relative`}>
                <div className={`imageContainer h-[250px] w-full`}>
                  <Image
                    src={getImgPath("/images/properties/skill3.jpg")}
                    alt={"ComSKill"}
                    width={400}
                    height={250}
                    className="w-full h-full object-cover group-hover:scale-125 duration-500"
                  />
                </div>
                <p className="absolute top-[10px] left-[10px] py-1 px-4 bg-white rounded-md text-primary items-center">
                  Top #3 Skill
                </p>
              </div>
              <div className={`p-5 sm:p-8 dark:text-white text-opacity-50`}>
                <div className="flex flex-col gap-1 border-b border-border dark:border-dark_border mb-6">
                  <div>
                    <p className="text-base text-gray ">Evaluation Test For </p>
                  </div>
                  <div className="flex justify-between items-center pb-4">
                    <div className="font-bold text-2xl group-hover:text-primary text-midnight_text dark:text-white">
                      Critical Thinking Skill
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-between">
                  <div className="flex flex-col">
                    <p className="md:text-xl text-lg font-bold flex gap-2">
                      5
                    </p>
                    <p className="text-sm text-gray">Questions</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="md:text-xl text-lg font-bold flex gap-2">
                      15
                    </p>
                    <p className="text-sm text-gray">Min</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="md:text-xl text-lg font-bold flex gap-2">
                      Essay
                    </p>
                    <p className="text-sm text-gray">Test Type</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
