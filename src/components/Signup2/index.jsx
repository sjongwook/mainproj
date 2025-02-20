"use client"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup2.css";
import { supabase } from "../../lib/supabaseClient";

export default function Signup2() {
    const navigate = useNavigate();

    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [name, setName] = useState("");

    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");

    // ✅ localStorage에서 데이터 불러오기
    useEffect(() => {
        const storedData = localStorage.getItem("signupData");
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setUserId(parsedData.user_id);
            setPassword(parsedData.password);
            setNickname(parsedData.nickname);
            setName(parsedData.name);
        }
    }, []);

    const handleSignup = async (e) => {
      e.preventDefault();
    
      // ✅ Supabase 회원가입 실행
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            phone_number: phoneNumber,
            address: address,
            nickname: nickname,
          },
        },
      });
    
      if (error) {
        console.error("🚨 회원가입 실패:", error.message);
        alert("회원가입 실패: " + error.message);
        return;
      }
    
      console.log("✅ 회원가입 성공:", data);
    
      // ✅ Supabase에서 생성된 `user.id(UUID)` 가져오기
      const user = data.user;
      if (user) {
        const userUuid = user.id;  // Supabase `auth.users.id` (UUID)
    
        // ✅ `users` 테이블에 `uuid_id` + `user_id`(로그인용) + 기타 정보 저장
        const { error: insertError } = await supabase
          .from("users")
          .upsert([
            {
              uuid_id: userUuid,    // ✅ Supabase에서 받은 UUID
              user_id: userId,      // ✅ 사용자가 입력한 로그인 아이디
              name: name,
              email: email,
              phone_number: phoneNumber,
              address: address,
              nickname: nickname,
            },
          ], 
          { 
            onConflict: ['uuid_id'] // uuid_id 충돌 시 업데이트
          });
    
        if (insertError) {
          console.error("🚨 유저 데이터 저장 실패:", insertError.message);
          alert("유저 정보 저장에 실패했습니다.");
          return;
        }
      }
    
      alert("회원가입 성공! 로그인 해주세요.");
      localStorage.removeItem("signupData");
      navigate("/LoginPage");
    };
    
    
      
      
    

    return (
        <div className="signup2-container" style={{ height: "100%", overflowY: "auto" }}>
            <div className="signup2-header">
                <a href="/SignupPage" className="signup2-back-button">
                    <img src="/icons/back.png" alt="뒤로가기" className="signup2-back-icon" />
                </a>
                <h1>
                    <img src="/icons/logo.png" alt="로고" className="signup2-logo" />
                </h1>
            </div>

            <div className="signup2-content">
                <h1 className="signup2-title">전화번호, 주소, 이메일을 입력하시오</h1>

                <form className="signup2-form" onSubmit={handleSignup}>
                    <div className="signup2-form-group">
                        <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                               placeholder="전화번호" className="signup2-tel-input" required />
                    </div>

                    <div className="signup2-form-group">
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                               placeholder="내 주소" className="signup2-address-input" required />
                    </div>

                    <div className="signup2-form-group">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                               placeholder="이메일" className="signup2-email-input" required />
                    </div>

                    <button type="submit" className="signup2-button">
                        회원가입
                    </button>
                </form>
            </div>
        </div>
    );
}
