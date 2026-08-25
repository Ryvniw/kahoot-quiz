"use client";

import { supabaseClient } from "@/lib/supabase-client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const CreateQuiz = () => {
  const supabase = supabaseClient();
  const router = useRouter();
  const [quizName, setQuizName] = useState("");
  const [questions, setQuestions] = useState([
    {
      question: "",
      point: 1,
      correctIndex: 0,
      options: ["", "", "", ""],
    },
  ]);
  const [aiQuiz, setAiQuiz] = useState({
    topic: "",
    quizCount: 5,
  });
  const handleAiQuiz = (event) => {
    if (event.target.name === "topic") {
      setAiQuiz({ ...aiQuiz, topic: event.target.value });
    }
    if (event.target.name === "count") {
      setAiQuiz({ ...aiQuiz, quizCount: Number(event.target.value) });
    }
  };

  const generateQuestion = async () => {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": process.env.TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-3.5-flash-lite",
          input: `Write ${aiQuiz.quizCount} multiple choice quiz questions about "${aiQuiz.topic}". Keep every question one short sentence. Each question needs exactly 4 short options, a point between 1 and 5, and correctIndex pointing at the right option.`,
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      point: { type: "integer" },
                      correctIndex: { type: "integer" },
                      options: {
                        type: "array",
                        items: { type: "string" },
                        minItems: 4,
                        maxItems: 4,
                      },
                    },
                    required: ["question", "point", "correctIndex", "options"],
                  },
                },
              },
              required: ["questions"],
            },
          },
        }),
      },
    );

    const data = await response.json();
    const generatedAi = JSON.parse(data.steps[1].content[0].text);

    setQuestions(generatedAi.questions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        point: 1,
        correctIndex: 0,
        options: ["", "", "", ""],
      },
    ]);
  };

  const updateQuestions = (qIndex, field, value) => {
    const updatedQuestion = questions.map((question, index) => {
      return index === qIndex ? { ...question, [field]: value } : question;
    });
    setQuestions(updatedQuestion);
  };

  const updateOptions = (qIndex, oIndex, value) => {
    const updatedOptions = questions.map((question, i) =>
      i === qIndex
        ? {
            ...question,
            options: question.options.map((option, o) =>
              o === oIndex ? value : option,
            ),
          }
        : question,
    );
    setQuestions(updatedOptions);
  };

  const createQuiz = async () => {
    const response = await supabase
      .from("quiz")
      .insert({
        name: quizName,
      })
      .select("*");

    const quizId = response.data[0].id;

    for (let i = 0; i < questions.length; i++) {
      const response = await supabase
        .from("quizQuestion")
        .insert({
          quizId: quizId,
          question: questions[i].question,
          questionOrder: i + 1,
          point: questions[i].point,
        })
        .select("*");
      console.log(response);

      const questionId = response.data[0].id;

      for (let j = 0; j < questions[i].options.length; j++) {
        const response = await supabase
          .from("questionOptions")
          .insert({
            questionId: questionId,
            option: questions[i].options[j],
            isCorrect: questions[i].correctIndex === j,
          })
          .select("*");
        console.log(response);
      }
    }

    if (response.data !== null) {
      router.push("/get-quiz");
    } else {
    }
  };
  if (questions === null) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#DBECF4] p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-6 rounded-3xl bg-white p-6 shadow-xl shadow-[#B7D0E1]/30 sm:p-8">
        <div className="border-b border-[#CADEED] pb-4">
          <h1 className="text-2xl font-bold text-[#3B5B75] sm:text-3xl">
            Create quiz
          </h1>
          <p className="text-xs font-medium text-[#7A9BB5]">
            Build and customize your questions
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#3B5B75]">
            Quiz name
          </label>
          <Input
            placeholder="My first quiz"
            value={quizName}
            onChange={(e) => setQuizName(event.target.value)}
            className="border-[#CADEED] bg-[#DBECF4]/20 text-[#2C4459] placeholder-[#7A9BB5]/60 focus-visible:ring-[#B7D0E1]"
          />
        </div>

        <div>
          Generate Ai Quiz
          <Input
            name="topic"
            value={aiQuiz.topic}
            onChange={handleAiQuiz}
          ></Input>
          <Input
            type="number"
            name="count"
            value={aiQuiz.quizCount}
            onChange={handleAiQuiz}
          ></Input>
          <Button onClick={generateQuestion}>Generate </Button>
        </div>

        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="space-y-5 rounded-2xl border border-[#CADEED] bg-[#DBECF4]/25 p-5 transition-all hover:border-[#B7D0E1] sm:p-6"
          >
            <div className="flex items-center justify-between border-b border-[#CADEED]/60 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#3B5B75]">
                Question {qIndex + 1}
              </h2>
              {/* {questions.length > 1 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeQuestion(qIndex)}
            >
              Remove
            </Button>
          )} */}
            </div>

            <Input
              placeholder="What is the capital of Mongolia?"
              value={q.question}
              onChange={(e) =>
                updateQuestions(qIndex, "question", e.target.value)
              }
              className="border-[#CADEED] bg-white text-[#2C4459] placeholder-[#7A9BB5]/60 focus-visible:ring-[#B7D0E1]"
            />

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-[#3B5B75]">
                Points
              </label>
              <Input
                type="number"
                min="1"
                className="w-24 border-[#CADEED] bg-white text-[#2C4459] focus-visible:ring-[#B7D0E1]"
                value={q.point}
                onChange={(e) =>
                  updateQuestions(qIndex, "point", e.target.value)
                }
              />
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7A9BB5]">
                Pick the correct answer
              </p>
              {q.options.map((option, oIndex) => (
                <div
                  key={oIndex}
                  className={`flex items-center gap-3 rounded-xl border p-2.5 transition-all ${
                    q.correctIndex === oIndex
                      ? "border-[#B7D0E1] bg-white shadow-sm ring-2 ring-[#B7D0E1]/40"
                      : "border-[#CADEED]/80 bg-white/60"
                  }`}
                >
                  <input
                    type="radio"
                    checked={q.correctIndex === oIndex}
                    onChange={(e) =>
                      updateQuestions(qIndex, "correctIndex", oIndex)
                    }
                    className="h-4 w-4 cursor-pointer accent-[#2C4459]"
                  />
                  <Input
                    placeholder={`Option ${oIndex + 1}`}
                    value={option}
                    onChange={(e) =>
                      updateOptions(qIndex, oIndex, e.target.value)
                    }
                    className="border-none bg-transparent shadow-none focus-visible:ring-0 text-[#2C4459] placeholder-[#7A9BB5]/60"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={addQuestion}
            className="border-[#CADEED] bg-white text-[#3B5B75] hover:bg-[#DBECF4]/50"
          >
            Add question
          </Button>
          <Button
            onClick={createQuiz}
            className="bg-[#B7D0E1] text-[#2C4459] font-medium hover:bg-[#A3C3D9] shadow-sm"
          >
            Create quiz
          </Button>
        </div>
      </div>
    </div>
  );
};
export default CreateQuiz;
