/*
  Warnings:

  - Added the required column `creatorId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "creatorId" TEXT NOT NULL;
