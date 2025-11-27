import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const rooms = pgTable("rooms", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable(
  "messages",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    roomId: varchar("room_id").notNull(),
    sender: text("sender").notNull(),
    senderPublicKey: text("sender_public_key"),
    recipient: text("recipient"),
    encryptedContent: text("encrypted_content").notNull(),
    hash: text("hash").notNull(),
    signature: text("signature"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    blockchainTxHash: text("blockchain_tx_hash"),
    verified: boolean("verified").default(false).notNull(),
  },
  (table) => ({
    roomIdx: index("messages_room_id_idx").on(table.roomId),
    timestampIdx: index("messages_timestamp_idx").on(table.timestamp),
  })
);

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
