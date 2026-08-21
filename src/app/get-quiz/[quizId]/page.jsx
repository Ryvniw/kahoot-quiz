"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Page = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const supabase = supabaseClient();
  const params = useParams();
  console.log(params);

  const quizId = params.quizId;

  useEffect(() => {
    if (quizId) {
      const fetchQuiz = async () => {
        const response = await supabase
          .from("quizQuestion")
          .select("*, questionOptions(*)")
          .eq("quizId", quizId);
        console.log(response);

        setQuestions(response.data);
      };

      fetchQuiz();
    }
  }, [quizId]);
  const handleAnswer = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };
  console.log(answers);

  let score = 0;
  let total = 0;

  for (let i = 0; i < questions.length; i++) {
    total = total + questions[i].point;
    const questionId = questions[i].id;
    const chooseOptionId = answers[questionId];
    const correctOption = questions[i].questionOptions.find(
      (option) => option.isCorrect,
    );
    console.log(chooseOptionId, correctOption);

    if (chooseOptionId === correctOption.id) {
      console.log("working");
      score = score + questions[i].point;
    }
  }
  console.log(score, total);

  const getStyle = (question, option) => {
    if (!isSubmitted) return "";
    if (option.isCorrect)
      return "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
    if (option.id === answers[question.id])
      return "border-rose-500 bg-rose-50 text-rose-900 font-bold";
    return "";
  };
  const handleSubmit = async () => {
    setIsSubmitted(true);

    const response = await supabase
      .from("attemps")
      .insert({
        quizId: quizId,
        total,
        score,
      })
      .select("*");

    const attemptId = response.data[0].id;
    console.log(attemptId);
    for (let i = 0; i < questions?.length; i++) {
      const correctOption = questions[i].questionOptions.find(
        (option) => option.isCorrect,
      );

      await supabase.from("attempAnswers").insert({
        attemptId: attemptId,
        answerId: answers[questions[i].id],
        questionId: questions[i].id,
        isCorrect: correctOption.id === answers[questions[i].id],
      });
    }
  };

  return (
    <div className="mx-auto my-12 flex max-w-4xl flex-col items-center justify-center px-4">
      {/* Questions List */}
      <div className="w-full space-y-6">
        {questions?.map((q, qIndex) => (
          <div
            key={qIndex}
            className="space-y-5 rounded-3xl border-2 border-[#CADEED] bg-white p-6 shadow-md shadow-[#A3C3D9]/20 transition-all sm:p-8"
          >
            {/* Header Section */}
            <div className="flex items-center justify-between border-b border-[#CADEED]/60 pb-4">
              <h2 className="text-xl font-black text-[#2C4459]">
                Question {qIndex + 1}
              </h2>
              <div className="flex items-center gap-2 rounded-2xl bg-[#A3C3D9]/20 px-4 py-1.5 border border-[#A3C3D9]/40">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3B5B75]">
                  Points
                </span>
                <span className="text-base font-extrabold text-[#2C4459]">
                  {q.point}
                </span>
              </div>
            </div>

            {/* Question Input */}
            <Input
              placeholder="What is the capital of Mongolia?"
              value={q.question}
              readOnly={true}
              className="h-12 rounded-2xl border-2 border-[#CADEED] bg-slate-50/50 px-4 text-base font-bold text-[#2C4459] shadow-none focus-visible:ring-0"
            />

            {/* Options Section */}
            <div className="space-y-3 pt-2">
              <p className="text-sm font-semibold text-[#5B7B97]">
                Pick the correct answer:
              </p>
              <div className="space-y-2.5">
                {q.questionOptions?.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className="group flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-[#CADEED] bg-white p-2.5 transition-all hover:border-[#A3C3D9] hover:bg-[#A3C3D9]/10"
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      onChange={() => handleAnswer(q.id, option.id)}
                      className="ml-2 h-5 w-5 accent-[#2C4459] cursor-pointer"
                    />
                    <Input
                      placeholder={`Option ${oIndex + 1}`}
                      value={option.option}
                      readOnly={true}
                      className={`h-10 border-0 bg-transparent text-base font-semibold shadow-none focus-visible:ring-0 ${getStyle(q, option)}`}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Score Banner */}
      {isSubmitted && (
        <div className="mt-8 flex w-full items-center justify-center rounded-2xl border-2 border-[#A3C3D9] bg-[#A3C3D9]/20 p-4 text-center">
          <span className="text-xl font-extrabold text-[#2C4459]">
            Score: {score} / {total}
          </span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        className="mt-8 w-full max-w-xs rounded-2xl bg-[#A3C3D9] py-6 text-lg font-bold text-[#2C4459] shadow-md transition-all hover:bg-[#8FB0C6] active:scale-95"
      >
        Check Answers
      </Button>
    </div>
  );
};

export default Page;
