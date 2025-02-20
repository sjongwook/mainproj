"use client"

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./DogInformation.css";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function DogInformation() {
  // 🟢 URL 파라미터(이전 페이지)로부터 mbti 값 가져오기
  const location = useLocation();
  const mbtiFromTest = location.state?.mbti || "";

  // 🟢 상태값들
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [weight, setWeight] = useState("");
  const [isYearValid, setIsYearValid] = useState(true);
  const [isMonthValid, setIsMonthValid] = useState(true);
  const [isDayValid, setIsDayValid] = useState(true);

  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petGender, setPetGender] = useState("");
  const [petNeutered, setPetNeutered] = useState("");
  const [petNotes, setPetNotes] = useState("");
  const [petSize, setPetSize] = useState("");

  // 🟢 이미지 관련 상태
  const [petImage, setPetImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // 🟢 JWT 토큰 (필요하다면)
  const [jwtToken, setJwtToken] = useState(null);

  // 🟢 useEffect들 (생년월일 검증, 세션 상태 확인 등)
  useEffect(() => {
    setIsYearValid(birthYear === "" || isValidYear(Number(birthYear)));
  }, [birthYear]);

  useEffect(() => {
    setIsMonthValid(birthMonth === "" || isValidMonth(Number(birthMonth)));
  }, [birthMonth]);

  useEffect(() => {
    setIsDayValid(
      birthDay === "" ||
        (birthYear !== "" &&
          birthMonth !== "" &&
          isValidDay(
            Number(birthYear),
            Number(birthMonth),
            Number(birthDay)
          ))
    );
  }, [birthYear, birthMonth, birthDay]);

  useEffect(() => {
    setJwtToken(localStorage.getItem("token") || null);
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          console.log("🚨 사용자 로그아웃됨");
          window.location.href = "/LoginPage";
        } else if (session) {
          console.log("✅ 로그인 유지됨:", session.user);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 🟢 이미지 변경 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPetImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 🟢 숫자 입력 핸들러 (생년월일, 몸무게 등)
  const handleNumberInput = (e, setter, maxLength) => {
    const value = e.target.value.replace(/\D/g, "");
    setter(value.slice(0, maxLength));
  };

  // 🟢 유효성 검사 함수들
  const isValidYear = (year) => {
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear;
  };
  const isValidMonth = (month) => month >= 1 && month <= 12;
  const isValidDay = (year, month, day) => {
    if (!year || !month || !day) return true;
    const daysInMonth = new Date(year, month, 0).getDate();
    return day >= 1 && day <= daysInMonth;
  };

  // 🟢 몸무게/크기 계산 함수
  const handleWeightInput = (e) => {
    const value = e.target.value.replace(/[^\d.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) return; // 소수점 1개만 허용
    if (parts[1] && parts[1].length > 1) parts[1] = parts[1].slice(0, 1);
    const updatedWeight = parts.join(".");
    setWeight(updatedWeight);
    setPetSize(calculateSize(updatedWeight));
  };
  const calculateSize = (weight) => {
    if (!weight) return "";
    return parseFloat(weight) > 15 ? "medium" : "small";
  };
  const calculateAge = (birthYear) => {
    const currentYear = new Date().getFullYear();
    return birthYear ? currentYear - birthYear : null;
  };

  // 🟢 Supabase 스토리지 업로드 함수
  const uploadImageToSupabase = async (file) => {
    if (!file) {
      console.error("❌ 업로드할 파일이 없습니다.");
      return null;
    }

    // 현재 로그인된 사용자 (UUID)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("🚨 사용자 정보를 가져올 수 없습니다:", userError?.message);
      alert("로그인이 필요합니다.");
      return null;
    }

    // 파일명 생성
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    // 업로드 경로: [UUID]/파일명
    const filePath = `${userData.user.id}/${fileName}`;
    console.log("📡 업로드할 파일 경로:", filePath);

    try {
      const { data, error } = await supabase.storage
        .from("pets_images")
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("❌ 이미지 업로드 실패:", error.message);
        return null;
      }

      const { publicUrl } = supabase.storage
        .from("pets_images")
        .getPublicUrl(filePath);

      console.log("🎉 업로드 성공! 이미지 URL:", publicUrl);
      return publicUrl;
    } catch (err) {
      console.error("❌ 이미지 업로드 중 오류 발생:", err.message);
      return null;
    }
  };

  // 🟢 폼 제출 → pets 테이블 insert
  const handleSubmit = async (e) => {
      e.preventDefault();
      console.log("✅ handleSubmit 실행됨");

      // 1) 현재 로그인된 유저 정보 가져오기 (백엔드 API 요청)
      let userId;
      try {
          const userResponse = await fetch("http://localhost:8000//api/auth/me", {
              method: "GET",
              credentials: "include", // 쿠키 기반 인증 지원
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("token")}`
              },
          });

          if (!userResponse.ok) throw new Error("로그인된 사용자 정보를 가져올 수 없습니다.");
          const userData = await userResponse.json();
          userId = userData.id; // ✅ 백엔드에서 반환된 사용자 UUID 사용
      } catch (error) {
          console.error("🚨 사용자 정보를 가져올 수 없습니다:", error.message);
          alert("로그인이 필요합니다.");
          window.location.href = "/LoginPage";
          return;
      }

      console.log("🔑 로그인된 사용자:", userId);

      // 2) 이미지 업로드 → 백엔드 API 사용
      let imageUrl = null;
      if (petImage) {
          const formData = new FormData();
          formData.append("file", petImage);

          try {
              const imageResponse = await fetch("http://localhost:8000/upload", {
                  method: "POST",
                  body: formData,
              });

              if (!imageResponse.ok) throw new Error("이미지 업로드 실패");
              const imageData = await imageResponse.json();
              imageUrl = imageData.image_url;
          } catch (error) {
              console.error("❌ 이미지 업로드 실패:", error.message);
              alert("이미지 업로드에 실패했습니다.");
              return;
          }
      }

    // 3) 반려동물 정보 백엔드로 전송
    const newPet = {
        owner_id: userId,  // ✅ 사용자 UUID 추가
        name: petName,
        gender: petGender,
        breed: petBreed,
        birth_date: `${birthYear}-${birthMonth}-${birthDay}`, // ✅ YYYY-MM-DD 형식
        weight: parseFloat(weight),
        is_neutered: petNeutered === "yes",
        notes: petNotes,
        image_url: imageUrl,
    };

    try {
        const response = await fetch("http://localhost:8000/pets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newPet),
        });

        if (!response.ok) throw new Error("반려동물 등록 실패");
        const petData = await response.json();

        alert("반려동물 정보가 성공적으로 등록되었습니다!");
        console.log("🎉 등록된 반려동물:", petData);
    } catch (error) {
        console.error("❌ 반려동물 정보 저장 실패:", error.message);
        alert("등록에 실패했습니다.");
    }
};

  

  
  

  return (
    <div className="doginformation-container">
          <header className="doginformation-header">
            <a href="/ProfilePage" className="doginformation-back-button">
              <img src="/icons/back.png" alt="뒤로가기" className="doginformation-back-icon" />
            </a>

            <div className="doginformation-image-container" onClick={() => document.getElementById("imageUpload").click()}>
      <div className="doginformation-image">
        {previewImage ? (
          <img src={previewImage} alt="미리보기" className="image-preview" />
        ) : (
          <span className="doginformation-text">사진 등록</span>
        )}
      </div>
      <input
        type="file"
        id="imageUpload"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }} // ✅ 실제 input을 숨김
      />
    </div>

      </header>

      <div className="doginformation-content">
        <form className="doginformation-form" onSubmit={handleSubmit}>
          <h2 className="doginformation-form-title">기본 사항</h2>

          <div className="doginformation-form-group">
            <label className="doginformation-label">이름</label>
            <input 
              type="text" 
              className="doginformation-form-input" 
              value={petName} 
              onChange={(e) => setPetName(e.target.value)}
              placeholder="반려견 이름"
            />
          </div>

          <div className="doginformation-form-group">
            <label className="doginformation-label">성별</label>
            <div className="doginformation-radio-group">
              <label className="doginformation-radio-label">
              <input 
                type="radio" 
                name="gender" 
                value="female" 
                checked={petGender === "female"} 
                onChange={() => setPetGender("female")}
              />
                <span>암컷아이</span>
              </label>
              <label className="doginformation-radio-label">
              <input 
                type="radio" 
                name="gender" 
                value="male" 
                checked={petGender === "male"} 
                onChange={() => setPetGender("male")}
              />
                <span>수컷아이</span>
              </label>
            </div>
          </div>

          <div className="doginformation-form-group">
            <label className="doginformation-label">품종</label>
            <input 
              type="text" 
              className="doginformation-form-input" 
              value={petBreed} 
              onChange={(e) => setPetBreed(e.target.value)}
              placeholder="품종"
            />
          </div>

          <div className="doginformation-form-group">
            <label className="doginformation-label">생일</label>
            <div className="doginformation-date-inputs">
              <input
                type="text"
                className={`doginformation-form-input doginformation-date-input ${!isYearValid ? "invalid-date" : ""}`}
                placeholder="YYYY"
                value={birthYear}
                onChange={(e) => handleNumberInput(e, setBirthYear, 4)}
              />
              <span className="doginformation-date-separator">-</span>
              <input
                type="text"
                className={`doginformation-form-input doginformation-date-input ${!isMonthValid ? "invalid-date" : ""}`}
                placeholder="MM"
                value={birthMonth}
                onChange={(e) => handleNumberInput(e, setBirthMonth, 2)}
              />
              <span className="doginformation-date-separator">-</span>
              <input
                type="text"
                className={`doginformation-form-input doginformation-date-input ${!isDayValid ? "invalid-date" : ""}`}
                placeholder="DD"
                value={birthDay}
                onChange={(e) => handleNumberInput(e, setBirthDay, 2)}
              />
            </div>
          </div>

          <div className="doginformation-form-group">
            <label className="doginformation-label">몸무게</label>
            <input
              type="text"
              className="doginformation-form-input"
              value={weight}
              onChange={handleWeightInput}
              placeholder="00.0"
            />
          </div>

          <div className="doginformation-form-group">
            <label className="doginformation-label">중성화</label>
            <div className="doginformation-radio-group">
              <label className="doginformation-radio-label">
              <input 
                type="radio" 
                name="neutered" 
                value="yes" 
                checked={petNeutered === "yes"} 
                onChange={() => setPetNeutered("yes")}
              />
                <span>했어요</span>
              </label>
              <label className="doginformation-radio-label">
              <input 
                type="radio" 
                name="neutered" 
                value="no" 
                checked={petNeutered === "no"} 
                onChange={() => setPetNeutered("no")}
              />
                <span>안 했어요</span>
              </label>
            </div>
          </div>

          <div className="doginformation-form-group">
            <label className="doginformation-label">멍BTI</label>
            <div className="doginformation-mbti-container">
              <input
                type="text"
                className="doginformation-form-input doginformation-mbti-input"
                value={mbtiFromTest} // 이전 테스트 결과로 자동 채워집니다.
                placeholder="ENFP"
                maxLength="4"
                readOnly
                disabled
                title="멍BTI 테스트 후 자동으로 입력됩니다"
              />
              <a href="/DbtiPage" className="doginformation-mbti-button-link">
                <button type="button" className="doginformation-mbti-button">
                  테스트
                </button>
              </a>
            </div>
          </div>

          <div className="doginformation-form-group">
            <label className="doginformation-label">참고사항</label>
            <textarea 
              className="doginformation-form-input doginformation-textarea" 
              value={petNotes} 
              onChange={(e) => setPetNotes(e.target.value)}
              placeholder="특이 사항을 입력해주세요."
            />
          </div>

          <button type="submit" className="doginformation-submit-button">
            등록 완료
          </button>
        </form>
      </div>
    </div>
  )
}