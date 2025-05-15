import axios from 'axios';
import { Inquiry } from '../../shared/schema';

// 환경 변수에서 텔레그램 봇 토큰과 채팅 ID 가져오기
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

/**
 * 텔레그램 봇을 통해 메시지를 보내는 함수
 * 
 * 참고: 이 기능을 사용하려면 텔레그램 봇 토큰과 채팅 ID가 필요합니다.
 * 1. BotFather를 통해 텔레그램 봇 생성 및 토큰 얻기
 * 2. 봇과 대화 시작 후 getUpdates API를 통해 채팅 ID 얻기
 */
export async function sendTelegramMessage(message: string): Promise<boolean> {
  try {
    // 텔레그램 봇 API URL
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    // 토큰 또는 채팅 ID가 없는 경우 실패 처리
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.log('텔레그램 봇 토큰 또는 채팅 ID가 없어 메시지 전송을 건너뜁니다.');
      return false;
    }

    // 텔레그램 API 호출하여 메시지 전송
    await axios.post(telegramUrl, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'  // HTML 포맷 지원 (굵게, 기울임, 링크 등)
    });

    console.log('텔레그램 메시지가 성공적으로 전송되었습니다.');
    return true;
  } catch (error) {
    console.error('텔레그램 메시지 전송 실패:', error);
    return false;
  }
}

/**
 * 문의 내용을 텔레그램 메시지 형식으로 포맷팅하여 전송하는 함수
 */
export async function sendInquiryToTelegram(inquiry: Inquiry): Promise<boolean> {
  try {
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
    
    // 텔레그램 메시지 형식 (HTML 태그 사용)
    const message = `
<b>🔔 김영심 변호사 홈페이지 문의</b>

📆 <b>접수시간:</b> ${formattedDate}
👤 <b>성함:</b> ${inquiry.name}
📞 <b>연락처:</b> ${inquiry.phone}
✉️ <b>이메일:</b> ${inquiry.email || '(없음)'}
📋 <b>문의유형:</b> ${inquiryType}

<b>📝 문의내용:</b>
${inquiry.message}

<i>※ 위 내용으로 문의가 접수되었습니다. 확인 부탁드립니다.</i>
    `;
    
    // 텔레그램으로 메시지 전송
    return await sendTelegramMessage(message);
  } catch (error) {
    console.error('텔레그램 문의 전송 실패:', error);
    return false;
  }
}

/**
 * 텔레그램 봇 연결 테스트 함수
 */
export async function testTelegramBot(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // 텔레그램 봇 토큰 확인
    if (!TELEGRAM_BOT_TOKEN) {
      return {
        success: false,
        message: '텔레그램 봇 토큰이 없습니다. 환경 변수를 확인해주세요.'
      };
    }

    // 텔레그램 채팅 ID 확인
    if (!TELEGRAM_CHAT_ID) {
      return {
        success: false,
        message: '텔레그램 채팅 ID가 없습니다. 환경 변수를 확인해주세요.'
      };
    }

    // 텔레그램 봇 정보 가져오기 API 호출
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`;
    const response = await axios.get(telegramUrl);
    
    if (response.data.ok && response.data.result) {
      const botName = response.data.result.first_name;
      const botUsername = response.data.result.username;
      
      // 테스트 메시지 전송
      const testMessage = `
<b>🤖 텔레그램 봇 연결 테스트</b>

✅ 봇이 성공적으로 연결되었습니다!
📋 봇 이름: ${botName}
🔗 봇 사용자명: @${botUsername}

<i>이 메시지는 텔레그램 봇 연결 테스트용입니다.</i>
      `;
      
      const sendResult = await sendTelegramMessage(testMessage);
      
      if (sendResult) {
        return {
          success: true,
          message: `텔레그램 봇 '${botName}'에 성공적으로 연결되었습니다. 테스트 메시지가 전송되었습니다.`
        };
      } else {
        return {
          success: false,
          message: '봇 연결은 성공했으나 메시지 전송에 실패했습니다. 채팅 ID를 확인해주세요.'
        };
      }
    } else {
      return {
        success: false,
        message: '텔레그램 봇 연결에 실패했습니다. 봇 토큰을 확인해주세요.'
      };
    }
  } catch (error: any) {
    console.error('텔레그램 봇 테스트 오류:', error);
    return {
      success: false,
      message: `연결 실패: ${error.message || '알 수 없는 오류'}`
    };
  }
}