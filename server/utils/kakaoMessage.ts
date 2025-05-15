import { Inquiry } from '../../shared/schema';

// 관리자 핸드폰 번호 (카카오톡 메시지를 받을 번호)
const ADMIN_PHONE = process.env.ADMIN_PHONE || '01027901115';

/**
 * 문의 내용을 카카오톡 메시지로 전송하는 함수
 * 
 * 참고: 이 함수는 상용 카카오톡 비즈니스 API가 아닌 전송 시뮬레이션입니다.
 * 실제 서비스에서는 카카오톡 비즈니스 API를 사용해야 합니다.
 */
export async function sendKakaoMessage(inquiry: Inquiry): Promise<boolean> {
  try {
    // 메시지 내용 구성
    const message = formatInquiryForKakao(inquiry);
    
    console.log(`[카카오톡 메시지 전송 시뮬레이션]`);
    console.log(`수신자: ${ADMIN_PHONE}`);
    console.log(`내용:\n${message}`);
    
    // 실제 서비스에서는 여기에 카카오톡 API 호출 코드가 들어갑니다.
    // 카카오톡 비즈니스 메시지 API를 사용하려면 사업자 인증 및 API 키가 필요합니다.
    // const response = await axios.post('https://kakao-api-endpoint/v1/send', {
    //   phone: ADMIN_PHONE,
    //   message: message
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.KAKAO_API_KEY}`
    //   }
    // });
    
    // 성공적으로 전송된 것으로 시뮬레이션
    return true;
  } catch (error) {
    console.error('카카오톡 메시지 전송 오류:', error);
    return false;
  }
}

/**
 * 문의 내용을 카카오톡 메시지 형식으로 포맷팅
 */
function formatInquiryForKakao(inquiry: Inquiry): string {
  // 날짜 포맷팅
  const createdAt = new Date(inquiry.createdAt || Date.now());
  const formattedDate = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')} ${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;
  
  // 문의 유형 한글화
  let inquiryType = "기타";
  switch (inquiry.inquiryType) {
    case "divorce": inquiryType = "이혼소송"; break;
    case "property": inquiryType = "재산분할"; break;
    case "custody": inquiryType = "양육권"; break;
    case "adultery": inquiryType = "상간소송"; break;
    case "inheritance": inquiryType = "상속소송"; break;
  }
  
  // 메시지 내용 구성
  return `[김영심 변호사 홈페이지 문의]
접수시간: ${formattedDate}
성함: ${inquiry.name}
연락처: ${inquiry.phone}
이메일: ${inquiry.email || '(없음)'}
문의유형: ${inquiryType}

[문의내용]
${inquiry.message}

※ 위 내용으로 문의가 접수되었습니다. 확인 부탁드립니다.`;
}