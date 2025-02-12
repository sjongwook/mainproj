"use client";
import { useNavigate } from "react-router-dom";
import "./Walk2.css";

export default function Walk2() {
  const navigate = useNavigate();

  return (
    <div className="Walk2-container">
      {/* Header and Input Section */}
      <div className="Walk2-white-section">
        <div className="Walk2-header">
          <button
            className="Walk2-back-button"
            onClick={() => navigate("/WalkPage")}
          >
            <img
              src="/icons/back.png"
              alt="뒤로가기"
              className="Walk2-back-icon"
            />
          </button>
          <h1 className="Walk2-title">
            어디로
            <br />
            방문하면 될까요?
          </h1>
        </div>
        <div className="Walk2-input-group">
          <label htmlFor="address" className="Walk2-input-label">
            주소
          </label>
          <input
            type="text"
            id="address"
            className="Walk2-input-field"
            placeholder="주소를 입력해주세요"
          />

          <label htmlFor="contact" className="Walk2-input-label">
            연락처
          </label>
          <input
            type="text"
            id="contact"
            className="Walk2-input-field"
            placeholder="연락처를 입력해주세요"
          />
        </div>
      </div>

      {/* Q&A Section */}
      <div className="Walk2-qa-section">
        <h2 className="Walk2-qa-title">Q. 예약이 불가능한 주소라고 떠요</h2>
        <p className="Walk2-qa-content">
          현재 고객님께서 계신 지역은 아쉽게도 아직 서비스
          <br />
          가능 지역에 포함되지 않아 서비스 이용이 어렵습니다.
        </p>
      </div>

      {/* Bottom Section */}
      <div className="Walk2-bottom-section">
        <div className="Walk2-bottom-content">
          <p className="Walk2-confirm-text">
            방문 주소를
            <br />
            확인해주세요
          </p>
          <button
            className="Walk2-next-button"
            onClick={() => navigate("/Walk3Page")}
          >
            다음으로
          </button>
        </div>
      </div>
    </div>
  );
}
