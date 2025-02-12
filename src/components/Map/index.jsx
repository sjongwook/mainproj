import React, { useEffect, useState } from "react";

const Map = ({ address }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null); // 마커 객체

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&autoload=false";
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById("map");
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 초기 서울 좌표
          level: 3,
        };
        const createdMap = new window.kakao.maps.Map(container, options);
        setMap(createdMap);
      });
    };

    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (address && map) {
      fetchCoordinates(address);
    }
  }, [address, map]);

  const fetchCoordinates = async (inputAddress) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/convert-address?address=${encodeURIComponent(inputAddress)}`);
      if (!response.ok) {
        throw new Error("좌표 변환 실패");
      }

      const data = await response.json();
      const coords = new window.kakao.maps.LatLng(data.latitude, data.longitude);

      // 지도 중심 이동
      map.setCenter(coords);

      // 기존 마커 제거
      if (marker) marker.setMap(null);

      // 새로운 마커 추가
      const newMarker = new window.kakao.maps.Marker({
        map: map,
        position: coords,
      });
      setMarker(newMarker);
    } catch (error) {
      console.error("주소 변환 오류:", error);
    }
  };

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "450px",
        marginTop: "20px",
        borderRadius: "8px",
      }}
    />
  );
};

export default Map;
