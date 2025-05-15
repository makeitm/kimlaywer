import { users, type User, type InsertUser, inquiries, type Inquiry, type InsertInquiry } from "@shared/schema";

// Storage interface for user and inquiry data
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiry(id: number): Promise<Inquiry | undefined>;
  getAllInquiries(): Promise<Inquiry[]>;
  markInquiryAsRead(id: number): Promise<Inquiry | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inquiriesMap: Map<number, Inquiry>;
  private userId: number;
  private inquiryId: number;

  constructor() {
    this.users = new Map();
    this.inquiriesMap = new Map();
    this.userId = 1;
    this.inquiryId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.inquiryId++;
    const now = new Date().toISOString();
    const inquiry: Inquiry = { 
      ...insertInquiry, 
      id, 
      createdAt: now,
      isRead: false
    };
    this.inquiriesMap.set(id, inquiry);
    return inquiry;
  }

  async getInquiry(id: number): Promise<Inquiry | undefined> {
    return this.inquiriesMap.get(id);
  }

  async getAllInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiriesMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async markInquiryAsRead(id: number): Promise<Inquiry | undefined> {
    const inquiry = this.inquiriesMap.get(id);
    if (inquiry) {
      const updatedInquiry = { ...inquiry, isRead: true };
      this.inquiriesMap.set(id, updatedInquiry);
      return updatedInquiry;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
