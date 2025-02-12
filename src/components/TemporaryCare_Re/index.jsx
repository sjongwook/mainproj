"use client";

import { useNavigate } from "react-router-dom"; // useNavigate를 올바르게 가져옵니다.
import DogCard from "../Dog";
import "./TemporaryCare_Re.css";


// 임시 데이터
const recommendedDogs = [
  {
    이름: "추천강아지1",
    "이미지 URL": "/placeholder.svg",
    몸무게: "5kg",
    성별: "수컷",
    "현 상황": "임시보호 가능",
  },
  {
    이름: "추천강아지2",
    "이미지 URL": "/placeholder.svg",
    몸무게: "3kg",
    성별: "암컷",
    "현 상황": "임시보호 가능",
  },
  {
    이름: "추천강아지3",
    "이미지 URL": "/placeholder.svg",
    몸무게: "4kg",
    성별: "수컷",
    "현 상황": "임시보호 가능",
  },
  {
    이름: "추천강아지4",
    "이미지 URL": "/placeholder.svg",
    몸무게: "6kg",
    성별: "암컷",
    "현 상황": "임시보호 가능",
  },
];

const TemporaryCare_Re = () => {
  const navigate = useNavigate();

  return (
    <div className="TemporaryCare_Re-temporary-care">
      <header className="TemporaryCare_Re-header">
        <div className="TemporaryCare_Re-header-content">
          <button className="TemporaryCare_Re-back-button">
            <img
              src="/icons/back.png"
              alt="뒤로가기"
              className="TemporaryCare_Re-back-icon"
              onClick={() => navigate("/TemporaryCarePage")}
            />
          </button>
          <div className="TemporaryCare_Re-title-description">
            <h1>맞춤추천</h1>
            <p className="TemporaryCare_Re-description">
              당신의 마음과 맞는 강아지를 찾아보세요
              <br />
              특별한 인연을 맺고, 함께 행복한 추억을 만들어가요!
            </p>
          </div>
        </div>
      </header>

      <main className="TemporaryCare_Re-main-content">
        <div className="TemporaryCare_Re-dogs-grid">
          {recommendedDogs.map((dog, index) => (
            <DogCard key={index} dog={dog} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default TemporaryCare_Re;
