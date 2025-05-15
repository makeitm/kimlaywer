import { Inquiry } from '../../shared/schema';
import { google, sheets_v4 } from 'googleapis';

// 환경 변수에서 스프레드시트 정보 가져오기
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '';

/**
 * 구글 스프레드시트에 문의 내용을 기록하는 함수
 * 
 * 참고: 이 기능을 사용하려면 다음이 필요합니다.
 * 1. 구글 서비스 계정 생성 및 키 파일 (JSON)
 * 2. 스프레드시트 ID
 * 3. 스프레드시트에 서비스 계정 이메일 공유 (편집자 권한)
 */
export async function saveInquiryToGoogleSheet(inquiry: Inquiry): Promise<boolean> {
  try {
    // 서비스 계정 인증 정보 확인
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
      console.log('구글 서비스 계정 정보가 없어 스프레드시트 저장을 건너뜁니다.');
      return false;
    }

    if (!SPREADSHEET_ID) {
      console.log('스프레드시트 ID가 없어 저장을 건너뜁니다.');
      return false;
    }

    // 서비스 계정 인증 정보 파싱
    const serviceAccountAuth = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    // 서비스 계정을 사용하여 인증
    const auth = new google.auth.JWT({
      email: serviceAccountAuth.client_email,
      key: serviceAccountAuth.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    // 구글 시트 API 초기화
    const sheets = google.sheets({ version: 'v4', auth });

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

    // 스프레드시트에 추가할 데이터 행
    const rowData = [
      inquiry.id.toString(),
      formattedDate,
      inquiry.name,
      inquiry.phone,
      inquiry.email || "(없음)",
      inquiryType,
      inquiry.message,
      inquiry.isRead ? "읽음" : "읽지 않음"
    ];

    // 스프레드시트에 데이터 추가 (첫 번째 시트에 추가)
    await createHeaderIfNeeded(sheets);
    
    // 데이터 행 추가
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:H',  // A~H 열에 데이터 추가
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });

    console.log(`구글 스프레드시트에 문의 ID ${inquiry.id}가 성공적으로 저장되었습니다.`);
    return true;
  } catch (error) {
    console.error('구글 스프레드시트 저장 오류:', error);
    return false;
  }
}

/**
 * 스프레드시트에 헤더가 없는 경우 헤더를 생성하는 함수
 */
async function createHeaderIfNeeded(sheets: sheets_v4.Sheets): Promise<void> {
  try {
    // 현재 스프레드시트 데이터 확인
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1:H1'
    });

    // 데이터가 없거나 첫 번째 행이 없는 경우 헤더 생성
    if (!response.data.values || response.data.values.length === 0) {
      const headerRow = [
        "ID", "접수일시", "이름", "연락처", "이메일", "문의유형", "문의내용", "읽음여부"
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A1:H1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headerRow]
        }
      });

      console.log('스프레드시트에 헤더를 생성했습니다.');
    }
  } catch (error) {
    console.error('헤더 생성 중 오류:', error);
    // 헤더 생성에 실패해도 계속 진행
  }
}

/**
 * 테스트용 함수: 스프레드시트 연결 테스트
 */
export async function testGoogleSheetsConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // 서비스 계정 인증 정보 확인
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
      return {
        success: false,
        message: '구글 서비스 계정 정보가 없습니다. 환경 변수를 확인해주세요.'
      };
    }

    if (!SPREADSHEET_ID) {
      return {
        success: false,
        message: '스프레드시트 ID가 없습니다. 환경 변수를 확인해주세요.'
      };
    }

    // 서비스 계정 인증 정보 파싱
    const serviceAccountAuth = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    // 서비스 계정을 사용하여 인증
    const auth = new google.auth.JWT({
      email: serviceAccountAuth.client_email,
      key: serviceAccountAuth.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    // 구글 시트 API 초기화
    const sheets = google.sheets({ version: 'v4', auth });

    // 스프레드시트 정보 가져오기 시도
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    return {
      success: true,
      message: `스프레드시트 '${response.data.properties?.title || SPREADSHEET_ID}'에 연결 성공!`
    };
  } catch (error: any) {
    console.error('구글 스프레드시트 연결 테스트 오류:', error);
    return {
      success: false,
      message: `연결 실패: ${error.message || '알 수 없는 오류'}`
    };
  }
}