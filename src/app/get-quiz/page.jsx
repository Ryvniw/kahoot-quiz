"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const Page = () => {
  const [quizs, setQuizs] = useState([]);
  const supabase = supabaseClient();
  const router = useRouter();

  useEffect(() => {
    const getQuizs = async () => {
      const response = await supabase.from("quiz").select("*");
      setQuizs(response.data || []);
    };
    getQuizs();
  }, []);

  return (
    <div className="mx-auto my-12 flex max-w-6xl flex-col items-center justify-center px-4 ">
      {/* Header Section */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-tight text-[#2C4459] sm:text-5xl">
          My Quizs
        </h1>
        <p className="mt-3 text-base font-medium text-[#5B7B97] sm:text-lg">
          Choose Your Quiz
        </p>
      </div>

      {/* Quiz Grid Section */}
      <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizs?.map((item) => {
          return (
            <div
              key={item.id}
              onClick={() => router.push(`/get-quiz/${item.id}`)}
              className="group flex min-h-[96px] cursor-pointer items-center justify-between gap-4 rounded-3xl border-2 border-[#CADEED] bg-white p-6 shadow-md shadow-[#B7D0E1]/25 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#B7D0E1] hover:shadow-xl hover:shadow-[#B7D0E1]/40"
            >
              <span className="line-clamp-2 text-lg font-extrabold text-[#3B5B75] transition-colors group-hover:text-[#2C4459]">
                {item.name}
              </span>
              <Button className="shrink-0 rounded-2xl bg-[#B7D0E1] px-6 py-3 text-base font-bold text-[#2C4459] shadow-md transition-all hover:bg-[#A3C3D9] active:scale-95">
                Play
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Page;
