/*
  Warnings:

  - You are about to drop the column `isPrivate` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `snippet` on the `Discussion` table. All the data in the column will be lost.
  - You are about to drop the `_CollectionSubjects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SubjectTags` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[subjectId]` on the table `Discussion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endIndex` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startIndex` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserRelationship` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CollectionSubjects" DROP CONSTRAINT "_CollectionSubjects_A_fkey";

-- DropForeignKey
ALTER TABLE "_CollectionSubjects" DROP CONSTRAINT "_CollectionSubjects_B_fkey";

-- DropForeignKey
ALTER TABLE "_SubjectTags" DROP CONSTRAINT "_SubjectTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubjectTags" DROP CONSTRAINT "_SubjectTags_B_fkey";

-- DropIndex
DROP INDEX "Tag_name_key";

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "isPrivate";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "endIndex" INTEGER NOT NULL,
ADD COLUMN     "startIndex" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Discussion" DROP COLUMN "snippet";

-- AlterTable
ALTER TABLE "SubjectPermission" ALTER COLUMN "role" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserRelationship" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "_CollectionSubjects";

-- DropTable
DROP TABLE "_SubjectTags";

-- CreateTable
CREATE TABLE "_SubjectToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubjectToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollectionToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SubjectToTag_B_index" ON "_SubjectToTag"("B");

-- CreateIndex
CREATE INDEX "_CollectionToSubject_B_index" ON "_CollectionToSubject"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Discussion_subjectId_key" ON "Discussion"("subjectId");

-- AddForeignKey
ALTER TABLE "_SubjectToTag" ADD CONSTRAINT "_SubjectToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectToTag" ADD CONSTRAINT "_SubjectToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToSubject" ADD CONSTRAINT "_CollectionToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToSubject" ADD CONSTRAINT "_CollectionToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
