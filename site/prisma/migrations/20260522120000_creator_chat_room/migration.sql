-- Add CREATOR chat room type for content-creator private group
ALTER TYPE "ChatRoomType" ADD VALUE IF NOT EXISTS 'CREATOR';
