"use client"

import { useNavigate, useLocation } from "react-router-dom"
import "./Dbti_result.css"

const DbtiResult = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { mbti } = location.state || {}

  return (
    <div className="DbtiResult-container">
      {/* 헤더 */}
      <header className="DbtiResult-header">
        <div className="DbtiResult-header-content">
          <img
            src="/resultlasticons/back.png"
            alt="뒤로가기"
            className="DbtiResult-back-icon"
            onClick={() => navigate(-1)}
          />
          <h1>멍BTI TEST</h1>
          <p className="DbtiResult-description">우리 댕댕이의 멍BTI를 검사해보세요!</p>
        </div>
      </header>

      {/* 결과 박스 */}
      <div className="DbtiResult-box">
        {mbti ? (
          <p className="DbtiResult-text">당신의 강아지 MBTI : {mbti}</p>
        ) : (
          <p className="DbtiResult-text">결과를 불러올 수 없습니다.</p>
        )}
      </div>

      {/* 등록하기 버튼 */}
      <button 
        className="DbtiResult-button" 
        onClick={() => navigate("/DogInformationPage")}
      >
        등록하기
      </button>
    </div>
  )
}

export default DbtiResult
