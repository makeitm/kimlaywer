import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInquirySchema } from "../shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { sendKakaoMessage } from "./utils/kakaoMessage";
import { saveInquiryToGoogleSheet, testGoogleSheetsConnection } from "./utils/googleSheets";
import { sendInquiryToTelegram, testTelegramBot } from "./utils/telegramBot";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for handling inquiry submissions
  app.post("/api/inquiries", async (req, res) => {
    try {
      const inquiryData = insertInquirySchema.parse(req.body);
      const savedInquiry = await storage.createInquiry(inquiryData);
      
      // 카카오톡으로 문의 내용 전송
      try {
        await sendKakaoMessage(savedInquiry);
      } catch (kakaoError) {
        console.error("카카오톡 메시지 전송 실패:", kakaoError);
        // 카카오톡 전송 실패해도 문의는 정상 접수
      }
      
      // 텔레그램으로 문의 내용 전송
      try {
        await sendInquiryToTelegram(savedInquiry);
      } catch (telegramError) {
        console.error("텔레그램 메시지 전송 실패:", telegramError);
        // 텔레그램 전송 실패해도 문의는 정상 접수
      }
      
      // 구글 스프레드시트에 문의 내용 저장
      try {
        await saveInquiryToGoogleSheet(savedInquiry);
      } catch (sheetError) {
        console.error("구글 스프레드시트 저장 실패:", sheetError);
        // 스프레드시트 저장 실패해도 문의는 정상 접수
      }
      
      res.status(201).json({ message: "문의가 접수되었습니다", data: savedInquiry });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Inquiry submission error:", error);
        res.status(500).json({ message: "문의 접수 중 오류가 발생했습니다" });
      }
    }
  });

  // API route for getting all inquiries (could be used for an admin panel later)
  app.get("/api/inquiries", async (req, res) => {
    try {
      const inquiries = await storage.getAllInquiries();
      res.status(200).json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "요청 처리 중 오류가 발생했습니다" });
    }
  });
  
  // 테스트용 API 엔드포인트 - 카카오톡 메시지 전송 테스트
  app.get("/api/test-kakao", async (req, res) => {
    try {
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
      const result = await sendKakaoMessage(testInquiry);
      res.status(200).json({ 
        success: result, 
        message: "카카오톡 메시지 전송 테스트 완료",
        testInquiry
      });
    } catch (error) {
      console.error("테스트 중 오류:", error);
      res.status(500).json({ message: "테스트 중 오류가 발생했습니다" });
    }
  });
  
  // 테스트용 API 엔드포인트 - 구글 스프레드시트 연결 테스트
  app.get("/api/test-sheets", async (req, res) => {
    try {
      // 구글 스프레드시트 연결 테스트
      const connectionResult = await testGoogleSheetsConnection();
      res.status(connectionResult.success ? 200 : 400).json(connectionResult);
    } catch (error) {
      console.error("구글 스프레드시트 테스트 중 오류:", error);
      res.status(500).json({ 
        success: false,
        message: "구글 스프레드시트 테스트 중 오류가 발생했습니다" 
      });
    }
  });
  
  // 테스트용 API 엔드포인트 - 구글 스프레드시트에 데이터 저장 테스트
  app.get("/api/test-sheets-save", async (req, res) => {
    try {
      // 테스트용 문의 데이터
      const testInquiry = {
        id: 888,
        name: "스프레드시트테스트",
        phone: "010-9876-5432",
        email: "sheets-test@example.com",
        inquiryType: "property",
        message: "구글 스프레드시트 저장 테스트입니다.",
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      // 구글 스프레드시트에 저장 테스트
      const result = await saveInquiryToGoogleSheet(testInquiry);
      res.status(200).json({ 
        success: result, 
        message: result ? "구글 스프레드시트 저장 테스트 성공" : "구글 스프레드시트 저장 테스트 실패 (인증 정보 확인 필요)",
        testInquiry
      });
    } catch (error) {
      console.error("구글 스프레드시트 저장 테스트 중 오류:", error);
      res.status(500).json({ 
        success: false,
        message: "구글 스프레드시트 저장 테스트 중 오류가 발생했습니다" 
      });
    }
  });
  
  // 테스트용 API 엔드포인트 - 텔레그램 봇 연결 테스트
  app.get("/api/test-telegram", async (req, res) => {
    try {
      // 텔레그램 봇 연결 테스트
      const connectionResult = await testTelegramBot();
      res.status(connectionResult.success ? 200 : 400).json(connectionResult);
    } catch (error) {
      console.error("텔레그램 봇 테스트 중 오류:", error);
      res.status(500).json({ 
        success: false,
        message: "텔레그램 봇 테스트 중 오류가 발생했습니다" 
      });
    }
  });
  
  // 테스트용 API 엔드포인트 - 텔레그램 메시지 전송 테스트
  app.get("/api/test-telegram-message", async (req, res) => {
    try {
      // 테스트용 문의 데이터
      const testInquiry = {
        id: 777,
        name: "텔레그램테스트",
        phone: "010-5555-6666",
        email: "telegram-test@example.com",
        inquiryType: "custody",
        message: "텔레그램 메시지 전송 테스트입니다.",
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      // 텔레그램으로 메시지 전송 테스트
      const result = await sendInquiryToTelegram(testInquiry);
      res.status(200).json({ 
        success: result, 
        message: result ? "텔레그램 메시지 전송 테스트 성공" : "텔레그램 메시지 전송 테스트 실패 (인증 정보 확인 필요)",
        testInquiry
      });
    } catch (error) {
      console.error("텔레그램 메시지 전송 테스트 중 오류:", error);
      res.status(500).json({ 
        success: false,
        message: "텔레그램 메시지 전송 테스트 중 오류가 발생했습니다" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
