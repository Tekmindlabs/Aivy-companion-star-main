/*
  Warnings:

  - Added the required column `fileType` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Document_vectorId_key";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "fileType" TEXT NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "version" INTEGER NOT NULL;
