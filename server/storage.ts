import {
  type User,
  type InsertUser,
  type Room,
  type InsertRoom,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Room methods
  listRooms(): Promise<Room[]>;
  getRoom(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;

  // Message methods
  getMessagesByRoom(roomId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageVerification(
    id: string,
    verified: boolean,
    txHash?: string
  ): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private rooms: Map<string, Room>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.messages = new Map();

    // Initialize with default rooms
    const defaultRooms: Room[] = [
      { id: "1", name: "general", createdAt: new Date() },
      { id: "2", name: "announcements", createdAt: new Date() },
      { id: "3", name: "random", createdAt: new Date() },
    ];
    defaultRooms.forEach((room) => this.rooms.set(room.id, room));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Room methods
  async listRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const room: Room = {
      ...insertRoom,
      id,
      createdAt: new Date(),
    };
    this.rooms.set(id, room);
    return room;
  }

  // Message methods
  async getMessagesByRoom(roomId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.roomId === roomId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      roomId: insertMessage.roomId,
      sender: insertMessage.sender,
      senderPublicKey: insertMessage.senderPublicKey,
      recipient: insertMessage.recipient || null,
      encryptedContent: insertMessage.encryptedContent,
      hash: insertMessage.hash,
      timestamp: new Date(),
      blockchainTxHash: insertMessage.blockchainTxHash || null,
      signature: insertMessage.signature,
      verified: insertMessage.verified ?? false,
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessageVerification(
    id: string,
    verified: boolean,
    txHash?: string
  ): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.verified = verified ? "true" : "false";
      if (txHash) {
        message.blockchainTxHash = txHash;
      }
      this.messages.set(id, message);
    }
  }
}

export const storage = new MemStorage();
