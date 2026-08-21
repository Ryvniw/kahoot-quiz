"use client";

import { supabaseClient } from "@/lib/supabase-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginUser = () => {
  const supabase = supabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUserName] = useState("");
  const router = useRouter();

  const handleEmail = (event) => {
    setEmail(event.target.value);
  };
  const handlePassword = (event) => {
    setPassword(event.target.value);
  };
  const handleUserName = (event) => {
    setUserName(event.target.value);
  };

  const signIn = async () => {
    const response = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    await supabase.from("profile").insert({
      authId: response.data.user.d,
      username: username,
    });
    console.log(response);
  };

  const login = async () => {
    const response = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
      username: username,
    });

    if (response.data.user !== null) {
      router.push("/create-quiz");
    } else {
      alert("try again");
    }
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#DBECF4] p-4 sm:p-6">
      <div className="w-full max-w-sm space-y-6 rounded-3xl border border-[#CADEED] bg-white p-8 shadow-xl shadow-[#B7D0E1]/30">
        {/* Header Section */}
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#CADEED] bg-[#DBECF4]/40 px-3 py-1 text-xs font-bold text-[#3B5B75]">
            KAHOOT
          </div>
          <h2 className="text-2xl font-bold text-[#3B5B75]">Welcome✨</h2>
          <p className="mt-1 text-xs font-medium text-[#7A9BB5]">Have Fun✨</p>
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          <Input
            type="email"
            placeholder="email"
            onChange={handleEmail}
            value={email}
            className="border-[#CADEED] bg-[#DBECF4]/20 text-[#2C4459] placeholder-[#7A9BB5]/60 focus-visible:ring-[#B7D0E1]"
          />
          <Input
            type="password"
            placeholder="password"
            onChange={handlePassword}
            value={password}
            className="border-[#CADEED] bg-[#DBECF4]/20 text-[#2C4459] placeholder-[#7A9BB5]/60 focus-visible:ring-[#B7D0E1]"
          />
          <Input
            name="username"
            placeholder="Username"
            onChange={handleUserName}
            value={username}
            className="border-[#CADEED] bg-[#DBECF4]/20 text-[#2C4459] placeholder-[#7A9BB5]/60 focus-visible:ring-[#B7D0E1]"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button
            onClick={login}
            className="w-full rounded-2xl bg-[#B7D0E1] py-2.5 font-bold text-[#2C4459] shadow-sm hover:bg-[#A3C3D9] active:scale-[0.98] transition-all"
          >
            Login✨
          </Button>
          <Button
            onClick={signIn}
            variant="outline"
            className="w-full rounded-2xl border-[#CADEED] bg-white py-2.5 font-semibold text-[#3B5B75] hover:bg-[#DBECF4]/40 active:scale-[0.98] transition-all"
          >
            Sign In✨
          </Button>
        </div>
      </div>
    </div>
  );
};
export default LoginUser;
