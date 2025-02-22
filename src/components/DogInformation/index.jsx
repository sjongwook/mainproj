"use client";

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./DogInformation.css";
import { supabase } from "../../lib/supabaseClient"; // ✅ Supabase
import { v4 as uuidv4 } from "uuid";

export default function DogInformation() {
  const location = useLocation();
  const mbtiFromTest = location.state?.mbti || "";

  // 🟢 상태값들 (생년월일, 몸무게, 이미지, etc.)
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [weight, setWeight] = useState("");
  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petGender, setPetGender] = useState("");
  const [petNeutered, setPetNeutered] = useState("");
  const [petNotes, setPetNotes] = useState("");
  const [petImage, setPetImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [petSize, setPetSize] = useState("");  // ✅ 추가된 상태값
  const [petMbti, setPetMbti] = useState(mbtiFromTest || ""); // ✅ 추가


    // 🟢 숫자 입력 핸들러 (생년월일, 몸무게 등)
  const handleNumberInput = (e, setter, maxLength) => {
    const value = e.target.value.replace(/\D/g, "");
    setter(value.slice(0, maxLength));
  };

  // 🟢 생년월일 유효성 검사
  const isYearValid = (year) => {
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear;
  };
  const isMonthValid = (month) => month >= 1 && month <= 12;
  const isDayValid = (year, month, day) => {
    if (!year || !month || !day) return true;
    const daysInMonth = new Date(year, month, 0).getDate();
    return day >= 1 && day <= daysInMonth;
  };

  // 🟢 몸무게 입력 핸들러
  const handleWeightInput = (e) => {
    const value = e.target.value.replace(/[^\d.]/g, ""); // 숫자와 소수점만 허용
    const parts = value.split(".");
    if (parts.length > 2) return; // 소수점 1개만 허용
    if (parts[1] && parts[1].length > 1) parts[1] = parts[1].slice(0, 1);
  
    const updatedWeight = parts.join(".");
    setWeight(updatedWeight);
  
    // ✅ 빈 값일 경우 NaN 방지
    if (updatedWeight === "") {
      setPetSize(""); // 크기 초기화
      return;
    }
  
    // ✅ 몸무게에 따라 크기 자동 설정
    const parsedWeight = parseFloat(updatedWeight);
    if (!isNaN(parsedWeight)) {
      setPetSize(parsedWeight > 15 ? "대형견" : "소형/중형견");
    }
  };
  


  // 🔴 localStorage 사용 X → supabase.auth.getSession()로 토큰 관리
  //    그래서 jwtToken 상태는 굳이 필요 없음

  // 🟢 생년월일 유효성 검사 등은 기존 코드 그대로 유지
  // ...

  // 🟢 이미지 변경 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPetImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 🟢 Supabase 스토리지 업로드 함수 (기존 코드와 동일)
  const uploadImageToSupabase = async (file) => {
    if (!file) {
      console.error("❌ 업로드할 파일이 없습니다.");
      return null;
    }

    // 현재 로그인된 사용자 (UUID)
    // → session에서 가져와도 되지만, supabase.auth.getUser()로도 가능
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
  // 기존 import, 상태값, 생년월일 처리, etc... 모두 그대로 둠

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("✅ handleSubmit 실행됨");

  // 1) Supabase 세션에서 JWT 가져오기
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session) {
    console.error("🚨 세션을 가져올 수 없습니다:", sessionError?.message);
    alert("로그인이 필요합니다.");
    window.location.href = "/LoginPage";
    return;
  }

  // Supabase JWT
  const supabaseJwt = sessionData.session.access_token;
  console.log("🔑 Supabase JWT:", supabaseJwt);

  // 2) 먼저 사진이 있으면 /api/upload 로 전송 → 업로드 후 URL 수령
  let imageUrl = null;
  if (petImage) {
    const formData = new FormData();
    formData.append("file", petImage);

    try {
      // 🔴 백엔드에 /api/upload 로 업로드
      const uploadResp = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadResp.ok) throw new Error("이미지 업로드 실패");
      const uploadJson = await uploadResp.json();

      imageUrl = uploadJson.image_url;  // 🔑 업로드된 이미지 URL
      console.log("🎉 이미지 업로드 성공, URL:", imageUrl);
    } catch (err) {
      console.error("❌ 이미지 업로드 오류:", err.message);
      alert("이미지 업로드에 실패했습니다.");
      return;
    }
  }

  // 3) 반려동물 정보 + 이미지 URL을 /api/pets 로 전송
  //    birthYear, birthMonth, birthDay 는 YYYY-MM-DD로 합침
  const newPet = {
    name: petName,
    breed: petBreed,
    size: petSize,  
    weight: parseFloat(weight),
    gender: petGender,
    notes: petNotes,
    pet_mbti: petMbti,  
    is_neutered: petNeutered === "yes",
    image_url: imageUrl,
    birth_date: `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`  
  };
  

  try {
    // 🔴 반려동물 등록
    const petResp = await fetch("http://localhost:8000/api/pets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Supabase JWT를 Bearer로 첨부 (백엔드가 인증에 사용)
        "Authorization": `Bearer ${supabaseJwt}`,
      },
      body: JSON.stringify(newPet),
    });

    if (!petResp.ok) throw new Error("반려동물 등록 실패");
    const petData = await petResp.json();

    alert("반려동물 정보가 성공적으로 등록되었습니다!");
    console.log("🎉 등록된 반려동물:", petData);
  } catch (err) {
    console.error("❌ 반려동물 정보 저장 실패:", err.message);
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