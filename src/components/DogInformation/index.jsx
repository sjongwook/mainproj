"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"  // 🔹 useNavigate 추가
import "./DogInformation.css"

export default function DogInformation() {
  const [birthYear, setBirthYear] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthDay, setBirthDay] = useState("")
  const [weight, setWeight] = useState("")
  const [isYearValid, setIsYearValid] = useState(true)
  const [isMonthValid, setIsMonthValid] = useState(true)
  const [isDayValid, setIsDayValid] = useState(true)

  const navigate = useNavigate()  // 🔹 navigate 정의 추가

  const handleNumberInput = (e, setter, maxLength) => {
    const value = e.target.value.replace(/\D/g, "")
    setter(value.slice(0, maxLength))
  }

  const handleWeightInput = (e) => {
    const value = e.target.value.replace(/[^\d.]/g, "")
    const parts = value.split(".")
    if (parts.length > 2) {
      return
    }
    if (parts[1] && parts[1].length > 1) {
      parts[1] = parts[1].slice(0, 1)
    }
    setWeight(parts.join("."))
  }

  const isValidYear = (year) => {
    const currentYear = new Date().getFullYear()
    return year >= 1900 && year <= currentYear
  }

  const isValidMonth = (month) => {
    return month >= 1 && month <= 12
  }

  const isValidDay = (year, month, day) => {
    if (!year || !month || !day) return true
    const daysInMonth = new Date(year, month, 0).getDate()
    return day >= 1 && day <= daysInMonth
  }

  useEffect(() => {
    setIsYearValid(birthYear === "" || isValidYear(Number(birthYear)))
  }, [birthYear])

  useEffect(() => {
    setIsMonthValid(birthMonth === "" || isValidMonth(Number(birthMonth)))
  }, [birthMonth])

  useEffect(() => {
    setIsDayValid(
      birthDay === "" ||
        (birthYear !== "" && birthMonth !== "" && isValidDay(Number(birthYear), Number(birthMonth), Number(birthDay))),
    )
  }, [birthYear, birthMonth, birthDay])

  return (
    <div className="doginformation-container">
      <header className="doginformation-header">
        <a href="/ProfilePage" className="doginformation-back-button">
          <img src="/icons/back.png" alt="뒤로가기" className="doginformation-back-icon" />
        </a>

        <div className="doginformation-image-container">
          <div className="doginformation-image">
            <span className="doginformation-text">사진 등록</span>
          </div>
        </div>
      </header>

      <div className="doginformation-content">
        <form className="doginformation-form">
          <h2 className="doginformation-form-title">기본 사항</h2>

          <div className="doginformation-form-group">
            <label className="doginformation-label">이름</label>
            <input type="text" className="doginformation-form-input" />
          </div>

          <div className="doginformation-form-group">
            <label className="doginformation-label">성별</label>
            <div className="doginformation-radio-group">
              <label className="doginformation-radio-label">
                <input type="radio" name="gender" value="female" />
                <span>여자아이</span>
              </label>
              <label className="doginformation-radio-label">
                <input type="radio" name="gender" value="male" />
                <span>남자아이</span>
              </label>
            </div> 
          </div>

          <div className="doginformation-form-group">
            <label className="doginformation-label">품종</label>
            <input type="text" className="doginformation-form-input" />
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
                <input type="radio" name="neutered" value="yes" />
                <span>했어요</span>
              </label>
              <label className="doginformation-radio-label">
                <input type="radio" name="neutered" value="no" />
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
            <textarea className="doginformation-form-input doginformation-textarea" />
          </div>

          <button
            type="button"
            className="doginformation-submit-button"
            onClick={() => navigate("/ProfilePage")}
          >
            등록 완료
          </button>
        </form>
      </div>
    </div>
  )
}
