"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

const AnalyticsDashboard: React.FC = () => {
  const trafficSources = [
    { label: "Clarity", value: 32, change: "+123%", color: "bg-yellow-400" },
    { label: "vocabulary", value: 29, change: "+65%", color: "bg-yellow-400" },
    { label: "richness", value: 35, change: "-32%", color: "bg-yellow-400" },
    { label: "fluency", value: 2.2, change: "+12%", color: "bg-yellow-400" },
    { label: "structure", value: 0.4, change: "-3%", color: "bg-yellow-400" },
    { label: "confidence", value: 15.4, change: "+15%", color: "bg-yellow-400" },
  ];

  const countries = [
    { label: "Effective Communication Skills",platform:"Youtube", value: 34, change: "+78%", url:"https://www.youtube.com/watch?v=6pYSbdGiDYw" },
    { label: "Positive Communication Skills", platform:"Youtube",value: 19, change: "+5%", url:"https://www.youtube.com/watch?v=xb3HFK2Gngk" },
    { label: "9 Habits for Clearer Speaking (I Wish I Knew Sooner)",platform:"Udemy", value: 39, change: "-32%", url:"https://www.youtube.com/watch?v=PiNN-HmHu7A" },
    // { label: "The Complete Communication Skills Master Class for Life",platform:"Udemy", value: 10, change: "-12%", url:"https://www.udemy.com/course/the-complete-communication-skills-master-class-for-life/" },
    // { label: "Communication Skills: Acquire Effective Communication",platform:"CourseEra", value: 23, change: "+35%", url:"https://www.udemy.com/course/communication-skills-acquire-effective-communication/?couponCode=CP251120G2" },
  ];

  return (
    <section className="px-20 dark:text-black">
        
    <div className="w-full p-6 space-y-8">
    <p className="text-xl font-bold text-slate-700 pl-3">Evaluation Matrics</p>
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-100 p-5 rounded-xl">
        {/* Card */}
        <div className="p-5 bg-white rounded-xl shadow-md flex flex-col">
          <div className="text-3xl font-semibold">10%</div>
          <div className="text-gray-500 text-sm">
            Clarity
          </div>
          <span className="text-red-500 text-sm -mt-1">-6%</span>

        </div>

        <div className="p-5 bg-white rounded-xl shadow-md flex flex-col">
          <div className="text-3xl font-semibold">65%</div>
          <div className="text-gray-500 text-sm">vocabulary</div>
          <span className="text-green-500 text-sm -mt-1">+10%</span>
        </div>

        <div className="p-5 bg-white rounded-xl shadow-md flex flex-col">
          <div className="text-3xl font-semibold">20%</div>
          <div className="text-gray-500 text-sm">
            richness
          </div>
          <span className="text-green-500 text-sm -mt-1">+29%</span>
        </div>

        <div className="p-5 bg-white rounded-xl shadow-md flex flex-col">
          <div className="text-3xl font-semibold">36%</div>
          <div className="text-gray-500 text-sm">Fluency</div>
          <span className="text-green-500 text-sm -mt-1">+52%</span>
        </div>

        <div className="p-5 bg-white rounded-xl shadow-md flex flex-col">
          <div className="text-3xl font-semibold">26%</div>
          <div className="text-gray-500 text-sm">Confidence</div>
          <span className="text-red-500 text-sm -mt-1">-42%</span>

        </div>
      </div>
        <p className="text-xl font-bold text-slate-700 pl-3">Evaluation results and Recommandations</p>
      {/* Traffic + Countries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100 p-5 rounded-xl">
        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-blue-500 text-lg">Evaluaion Results</h3>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>

          <div className="space-y-5">
            {trafficSources.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>{item.label}</span>
                  <span className={`${item.change.includes("-") ? "text-red-500" : "text-green-600"}`}>
                    {item.change}
                  </span>
                </div>

                <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                  <div
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-blue-500">Recommandations to Enhance skill</h3>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>

          <div className="space-y-5">
            {countries.map((country, i) => (
              <div key={i} className="bg-slate-100 p-3 rounded-md border border-slate-300">
                <div className="flex justify-between text-gray-700 text-sm">
                  <span className="text-base font-semibold">{country.label}</span>
                     <button className="bg-blue-500 p-1 rounded-md text-white hover:bg-blue-700"><a href={country.url}>View</a></button>
                </div>

                <div className="w-fit p-1 border rounded-md border-slate-500 mt-1">
                    {country.platform}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
    </section>
  );
};

export default AnalyticsDashboard;
