import { type User, type InsertUser, type File, type InsertFile, type AuditLog, type InsertAuditLog } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // File operations
  getFile(id: string): Promise<File | undefined>;
  getFileByCID(cid: string): Promise<File | undefined>;
  getFilesByUser(userId: string): Promise<File[]>;
  getAllFiles(): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: string): Promise<boolean>;

  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private files: Map<string, File>;
  private auditLogs: Map<string, AuditLog>;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.auditLogs = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      walletAddress: insertUser.walletAddress,
      nonce: insertUser.nonce || null,
      isAdmin: insertUser.isAdmin || false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // File operations
  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFileByCID(cid: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find((file) => file.cid === cid);
  }

  async getFilesByUser(userId: string): Promise<File[]> {
    return Array.from(this.files.values())
      .filter((file) => file.userId === userId)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  async getAllFiles(): Promise<File[]> {
    return Array.from(this.files.values())
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = randomUUID();
    const file: File = {
      id,
      userId: insertFile.userId,
      cid: insertFile.cid,
      filename: insertFile.filename,
      fileSize: insertFile.fileSize,
      fileType: insertFile.fileType,
      uploadedAt: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }

  // Audit log operations
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = {
      id,
      userId: insertLog.userId,
      action: insertLog.action,
      fileId: insertLog.fileId || null,
      timestamp: new Date(),
      metadata: insertLog.metadata || null,
    };
    this.auditLogs.set(id, log);
    return log;
  }

  async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
