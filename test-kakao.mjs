// 테스트 스크립트: 카카오톡 메시지 전송 테스트
import { sendKakaoMessage } from './server/utils/kakaoMessage.js';

// 테스트용 문의 데이터
const testInquiry = {
  id: 999,
  name: "테스트사용자",
  phone: "010-1234-5678",
  email: "test@example.com",
  inquiryType: "divorce",
  message: "이혼 관련 상담을 받고 싶습니다. 연락 부탁드립니다.",
  createdAt: new Date().toISOString(),
  isRead: false
};

// 카카오톡 메시지 전송 테스트
console.log("카카오톡 메시지 전송 테스트 시작...");
sendKakaoMessage(testInquiry)
  .then(result => {
    console.log("전송 결과:", result ? "성공" : "실패");
  })
  .catch(err => {
    console.error("오류 발생:", err);
  });
