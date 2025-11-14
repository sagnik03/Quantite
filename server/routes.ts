import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { authenticateToken, requireAdmin, generateToken, type AuthRequest } from "./middleware/auth";
import { verifySignature, generateNonce } from "./lib/signature";
import { uploadToIPFS } from "./lib/web3storage";
import { nonceRequestSchema, verifySignatureSchema, insertFileSchema } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/nonce", async (req, res) => {
    try {
      const { walletAddress } = nonceRequestSchema.parse(req.body);
      
      let user = await storage.getUserByWallet(walletAddress);
      const nonce = generateNonce();

      if (!user) {
        user = await storage.createUser({
          walletAddress,
          nonce,
          isAdmin: false,
        });
      } else {
        await storage.updateUser(user.id, { nonce });
      }

      res.json({ nonce });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });

  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { walletAddress, signature, nonce } = verifySignatureSchema.parse(req.body);

      const user = await storage.getUserByWallet(walletAddress);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (user.nonce !== nonce) {
        return res.status(401).json({ error: "Invalid nonce" });
      }

      const message = `Sign this message to authenticate with Web3 Dashboard.\n\nNonce: ${nonce}`;
      const isValid = verifySignature(message, signature, walletAddress);

      if (!isValid) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      await storage.updateUser(user.id, { nonce: null });

      const token = generateToken(user.id);

      res.json({
        token,
        isAdmin: user.isAdmin,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Verification failed" });
    }
  });

  // File routes (protected)
  app.get("/api/files", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const files = await storage.getFilesByUser(req.userId);
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch files" });
    }
  });

  app.post("/api/files/upload", authenticateToken, upload.single("file"), async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const cid = await uploadToIPFS(req.file.buffer, req.file.originalname);

      const file = await storage.createFile({
        userId: req.userId,
        cid,
        filename: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
      });

      await storage.createAuditLog({
        userId: req.userId,
        action: "FILE_UPLOAD",
        fileId: file.id,
        metadata: JSON.stringify({ filename: file.filename, cid }),
      });

      res.json(file);
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });

  app.delete("/api/files/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      if (file.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized to delete this file" });
      }

      await storage.deleteFile(req.params.id);

      await storage.createAuditLog({
        userId: req.userId,
        action: "FILE_DELETE",
        fileId: file.id,
        metadata: JSON.stringify({ filename: file.filename }),
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Delete failed" });
    }
  });

  // Admin routes (protected + admin only)
  app.get("/api/admin/files", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const allFiles = await storage.getAllFiles();
      
      const filesWithUsers = await Promise.all(
        allFiles.map(async (file) => {
          const user = await storage.getUser(file.userId);
          return {
            ...file,
            walletAddress: user?.walletAddress || "Unknown",
          };
        })
      );

      res.json(filesWithUsers);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch files" });
    }
  });

  app.get("/api/admin/audit", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const logs = await storage.getAuditLogs(50);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch audit logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
