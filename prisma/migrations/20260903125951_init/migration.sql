-- CreateEnum
CREATE TYPE "CEFRLevel" AS ENUM ('A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('GRAMMAR', 'VOCABULARY', 'READING', 'LISTENING', 'WRITING', 'SPEAKING');

-- CreateEnum
CREATE TYPE "LearningGoalType" AS ENUM ('TRAVEL', 'WORK', 'CONVERSATION', 'MOVING', 'SCHOOL', 'EXAMS', 'HOBBIES', 'FLUENCY');

-- CreateEnum
CREATE TYPE "SpanishRegion" AS ENUM ('SPAIN', 'MEXICO', 'ARGENTINA', 'COLOMBIA', 'LATAM_GENERAL');

-- CreateEnum
CREATE TYPE "ImmersionLevel" AS ENUM ('ENGLISH_ASSISTANCE', 'SPANISH_AND_ENGLISH', 'SPANISH_MINIMAL_ASSISTANCE', 'SPANISH_ONLY');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('VOCABULARY', 'GRAMMAR', 'MIXED', 'LISTENING', 'WRITING', 'SPEAKING', 'CONVERSATION', 'READING');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('MULTIPLE_CHOICE', 'FLASHCARD', 'MATCHING', 'TRANSLATION', 'FILL_BLANK', 'CONTEXTUAL_SELECT', 'SENTENCE_TRANSFORM', 'ERROR_CORRECTION', 'TENSE_SELECT', 'SENTENCE_ORDER', 'READING_COMPREHENSION', 'LISTENING_COMPREHENSION', 'DICTATION', 'MISSING_WORD', 'WRITING_PROMPT', 'SPEAKING_PROMPT');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('NOT_SURE', 'SOMEWHAT_SURE', 'VERY_SURE');

-- CreateEnum
CREATE TYPE "MistakeCategory" AS ENUM ('GRAMMAR', 'VOCABULARY', 'WORD_ORDER', 'PREPOSITION', 'CONJUGATION', 'GENDER', 'LISTENING', 'WRITING', 'PRONUNCIATION');

-- CreateEnum
CREATE TYPE "MistakeSourceType" AS ENUM ('EXERCISE', 'WRITING', 'SPEAKING', 'LISTENING', 'CONVERSATION', 'PLACEMENT_TEST');

-- CreateEnum
CREATE TYPE "ReviewItemType" AS ENUM ('VOCABULARY', 'GRAMMAR', 'MISTAKE', 'COLLOCATION');

-- CreateEnum
CREATE TYPE "VocabStatus" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'MASTERED');

-- CreateEnum
CREATE TYPE "SessionActivityType" AS ENUM ('DAILY', 'LESSON', 'REVIEW', 'PRACTICE', 'ASSESSMENT', 'CONVERSATION', 'STORY', 'LISTENING', 'WRITING', 'SPEAKING');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('PLACEMENT', 'LEVEL_COMPLETION', 'PROGRESS_CHECK');

-- CreateEnum
CREATE TYPE "ConversationRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ListeningSpeed" AS ENUM ('SLOW', 'NORMAL', 'NATURAL');

-- CreateEnum
CREATE TYPE "ContentImportSource" AS ENUM ('ARTICLE', 'YOUTUBE_TRANSCRIPT', 'VIDEO_TRANSCRIPT', 'MOVIE_DIALOGUE', 'PODCAST_TRANSCRIPT', 'NEWS', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "selfReportedLevel" "CEFRLevel",
    "region" "SpanishRegion" NOT NULL DEFAULT 'LATAM_GENERAL',
    "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 10,
    "focusAreas" "SkillType"[],
    "immersionLevel" "ImmersionLevel" NOT NULL DEFAULT 'SPANISH_AND_ENGLISH',
    "correctionStyle" TEXT NOT NULL DEFAULT 'after',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLearningGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" "LearningGoalType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLearningGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLevel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" "CEFRLevel" NOT NULL,
    "subLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallLevel" "CEFRLevel" NOT NULL DEFAULT 'A0',
    "overallSub" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grammarLevel" "CEFRLevel" NOT NULL DEFAULT 'A0',
    "grammarSub" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vocabularyLevel" "CEFRLevel" NOT NULL DEFAULT 'A0',
    "vocabularySub" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "readingLevel" "CEFRLevel" NOT NULL DEFAULT 'A0',
    "readingSub" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "listeningLevel" "CEFRLevel" NOT NULL DEFAULT 'A0',
    "listeningSub" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "writingLevel" "CEFRLevel" NOT NULL DEFAULT 'A0',
    "writingSub" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "speakingLevel" "CEFRLevel" NOT NULL DEFAULT 'A0',
    "speakingSub" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseLevel" (
    "id" TEXT NOT NULL,
    "level" "CEFRLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "CourseLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "courseLevelId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "LessonType" NOT NULL,
    "order" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "examples" JSONB NOT NULL,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "skillTags" "SkillType"[],
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 8,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT,
    "type" "ExerciseType" NOT NULL,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "skillTag" "SkillType" NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "prompt" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'independent_practice',
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "sourceGeneratedLessonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userAnswer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "confidence" "ConfidenceLevel",
    "timeSpentMs" INTEGER,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL,
    "spanish" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "gender" TEXT,
    "pronunciation" TEXT,
    "audioUrl" TEXT,
    "exampleEs" TEXT NOT NULL,
    "exampleEn" TEXT NOT NULL,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "synonyms" TEXT[],
    "antonyms" TEXT[],
    "relatedWords" TEXT[],
    "collocations" TEXT[],
    "region" "SpanishRegion" NOT NULL DEFAULT 'LATAM_GENERAL',
    "regionNotes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVocabulary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "status" "VocabStatus" NOT NULL DEFAULT 'NEW',
    "exposure" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "understanding" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retention" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "production" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mastery" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "timesIncorrect" INTEGER NOT NULL DEFAULT 0,
    "savedByUser" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarTopic" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "examples" JSONB NOT NULL,
    "commonMistakes" JSONB NOT NULL,
    "exceptions" JSONB NOT NULL,
    "regionalNotes" JSONB NOT NULL,
    "relatedTopicSlugs" TEXT[],

    CONSTRAINT "GrammarTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGrammarProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grammarTopicId" TEXT NOT NULL,
    "mastery" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "lastPracticedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGrammarProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mistake" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "MistakeCategory" NOT NULL,
    "sourceType" "MistakeSourceType" NOT NULL,
    "sourceId" TEXT,
    "userInput" TEXT NOT NULL,
    "correctForm" TEXT NOT NULL,
    "explanation" TEXT,
    "cefrLevel" "CEFRLevel",
    "relatedGrammarTopicId" TEXT,
    "relatedVocabularyId" TEXT,
    "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastOccurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemType" "ReviewItemType" NOT NULL,
    "refId" TEXT NOT NULL,
    "mistakeId" TEXT,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3),
    "forgettingProbability" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "errorFrequency" INTEGER NOT NULL DEFAULT 0,
    "importance" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "priorityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleplayCharacter" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "region" "SpanishRegion" NOT NULL,
    "difficulty" "CEFRLevel" NOT NULL,
    "speakingStyle" TEXT NOT NULL,
    "correctionBehavior" TEXT NOT NULL DEFAULT 'after',
    "avatarEmoji" TEXT NOT NULL DEFAULT '🗣️',
    "systemPromptSeed" TEXT NOT NULL,

    CONSTRAINT "RoleplayCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'roleplay',
    "characterId" TEXT,
    "scenario" TEXT,
    "region" "SpanishRegion" NOT NULL DEFAULT 'LATAM_GENERAL',
    "difficulty" "CEFRLevel" NOT NULL DEFAULT 'A1',
    "immersionLevel" "ImmersionLevel" NOT NULL DEFAULT 'SPANISH_AND_ENGLISH',
    "correctionMode" TEXT NOT NULL DEFAULT 'after',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "ConversationRole" NOT NULL,
    "content" TEXT NOT NULL,
    "corrections" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SessionActivityType" NOT NULL,
    "activities" JSONB NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LearningSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "exercisesCompleted" INTEGER NOT NULL DEFAULT 0,
    "wordsMastered" INTEGER NOT NULL DEFAULT 0,
    "studyMinutesTotal" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "targetLevel" "CEFRLevel",
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "overallLevel" "CEFRLevel",
    "overallSub" DOUBLE PRECISION,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "recommendation" TEXT,
    "responses" JSONB NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResult" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "skill" "SkillType" NOT NULL,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "AssessmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "region" "SpanishRegion" NOT NULL DEFAULT 'LATAM_GENERAL',
    "startStepKey" TEXT NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryStep" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "stepKey" TEXT NOT NULL,
    "speaker" TEXT,
    "textEs" TEXT NOT NULL,
    "textEn" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "isEnding" BOOLEAN NOT NULL DEFAULT false,
    "vocabHighlights" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "StoryStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStoryProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "currentStepKey" TEXT NOT NULL,
    "choicesMade" JSONB NOT NULL DEFAULT '[]',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserStoryProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "content" TEXT NOT NULL,
    "evaluation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningExercise" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "region" "SpanishRegion" NOT NULL DEFAULT 'LATAM_GENERAL',
    "speed" "ListeningSpeed" NOT NULL DEFAULT 'NORMAL',
    "topic" TEXT NOT NULL,
    "transcriptEs" TEXT NOT NULL,
    "transcriptEn" TEXT NOT NULL,
    "audioUrl" TEXT,
    "questions" JSONB NOT NULL,
    "keyExpressions" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "ListeningExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listeningExerciseId" TEXT NOT NULL,
    "comprehensionScore" DOUBLE PRECISION NOT NULL,
    "missedExpressions" TEXT[],
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "transcript" TEXT NOT NULL,
    "audioUrl" TEXT,
    "evaluation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentImport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" "ContentImportSource" NOT NULL,
    "title" TEXT,
    "rawText" TEXT NOT NULL,
    "cefrEstimate" "CEFRLevel",
    "extraction" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedLesson" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentImportId" TEXT,
    "topic" TEXT NOT NULL,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLearningGoal_userId_goal_key" ON "UserLearningGoal"("userId", "goal");

-- CreateIndex
CREATE INDEX "UserLevel_userId_createdAt_idx" ON "UserLevel"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SkillProfile_userId_key" ON "SkillProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseLevel_level_key" ON "CourseLevel"("level");

-- CreateIndex
CREATE UNIQUE INDEX "CourseLevel_order_key" ON "CourseLevel"("order");

-- CreateIndex
CREATE INDEX "CourseLevel_order_idx" ON "CourseLevel"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Module_slug_key" ON "Module"("slug");

-- CreateIndex
CREATE INDEX "Module_courseLevelId_order_idx" ON "Module"("courseLevelId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_slug_key" ON "Lesson"("slug");

-- CreateIndex
CREATE INDEX "Lesson_moduleId_order_idx" ON "Lesson"("moduleId", "order");

-- CreateIndex
CREATE INDEX "Exercise_lessonId_idx" ON "Exercise"("lessonId");

-- CreateIndex
CREATE INDEX "Exercise_cefrLevel_skillTag_idx" ON "Exercise"("cefrLevel", "skillTag");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_createdAt_idx" ON "ExerciseAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_exerciseId_idx" ON "ExerciseAttempt"("exerciseId");

-- CreateIndex
CREATE INDEX "Vocabulary_cefrLevel_idx" ON "Vocabulary"("cefrLevel");

-- CreateIndex
CREATE INDEX "Vocabulary_tags_idx" ON "Vocabulary"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "Vocabulary_spanish_translation_key" ON "Vocabulary"("spanish", "translation");

-- CreateIndex
CREATE INDEX "UserVocabulary_userId_nextReviewAt_idx" ON "UserVocabulary"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "UserVocabulary_userId_status_idx" ON "UserVocabulary"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "UserVocabulary_userId_vocabularyId_key" ON "UserVocabulary"("userId", "vocabularyId");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarTopic_slug_key" ON "GrammarTopic"("slug");

-- CreateIndex
CREATE INDEX "GrammarTopic_cefrLevel_order_idx" ON "GrammarTopic"("cefrLevel", "order");

-- CreateIndex
CREATE INDEX "UserGrammarProgress_userId_mastery_idx" ON "UserGrammarProgress"("userId", "mastery");

-- CreateIndex
CREATE UNIQUE INDEX "UserGrammarProgress_userId_grammarTopicId_key" ON "UserGrammarProgress"("userId", "grammarTopicId");

-- CreateIndex
CREATE INDEX "Mistake_userId_resolved_idx" ON "Mistake"("userId", "resolved");

-- CreateIndex
CREATE INDEX "Mistake_userId_category_idx" ON "Mistake"("userId", "category");

-- CreateIndex
CREATE INDEX "ReviewItem_userId_dueAt_idx" ON "ReviewItem"("userId", "dueAt");

-- CreateIndex
CREATE INDEX "ReviewItem_userId_priorityScore_idx" ON "ReviewItem"("userId", "priorityScore");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewItem_userId_itemType_refId_key" ON "ReviewItem"("userId", "itemType", "refId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleplayCharacter_slug_key" ON "RoleplayCharacter"("slug");

-- CreateIndex
CREATE INDEX "Conversation_userId_startedAt_idx" ON "Conversation"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "ConversationMessage_conversationId_createdAt_idx" ON "ConversationMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "LearningSession_userId_startedAt_idx" ON "LearningSession"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_key" ON "UserProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_key_key" ON "Achievement"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "Assessment_userId_type_startedAt_idx" ON "Assessment"("userId", "type", "startedAt");

-- CreateIndex
CREATE INDEX "AssessmentResult_assessmentId_idx" ON "AssessmentResult"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "StoryStep_storyId_stepKey_key" ON "StoryStep"("storyId", "stepKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserStoryProgress_userId_storyId_key" ON "UserStoryProgress"("userId", "storyId");

-- CreateIndex
CREATE INDEX "WritingSubmission_userId_createdAt_idx" ON "WritingSubmission"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ListeningExercise_cefrLevel_idx" ON "ListeningExercise"("cefrLevel");

-- CreateIndex
CREATE INDEX "ListeningAttempt_userId_createdAt_idx" ON "ListeningAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SpeakingAttempt_userId_createdAt_idx" ON "SpeakingAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "GeneratedLesson_userId_createdAt_idx" ON "GeneratedLesson"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningGoal" ADD CONSTRAINT "UserLearningGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLevel" ADD CONSTRAINT "UserLevel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProfile" ADD CONSTRAINT "SkillProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseLevelId_fkey" FOREIGN KEY ("courseLevelId") REFERENCES "CourseLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LearningSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVocabulary" ADD CONSTRAINT "UserVocabulary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVocabulary" ADD CONSTRAINT "UserVocabulary_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarTopic" ADD CONSTRAINT "GrammarTopic_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGrammarProgress" ADD CONSTRAINT "UserGrammarProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGrammarProgress" ADD CONSTRAINT "UserGrammarProgress_grammarTopicId_fkey" FOREIGN KEY ("grammarTopicId") REFERENCES "GrammarTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mistake" ADD CONSTRAINT "Mistake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewItem" ADD CONSTRAINT "ReviewItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewItem" ADD CONSTRAINT "ReviewItem_mistakeId_fkey" FOREIGN KEY ("mistakeId") REFERENCES "Mistake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "RoleplayCharacter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningSession" ADD CONSTRAINT "LearningSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryStep" ADD CONSTRAINT "StoryStep_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStoryProgress" ADD CONSTRAINT "UserStoryProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStoryProgress" ADD CONSTRAINT "UserStoryProgress_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingSubmission" ADD CONSTRAINT "WritingSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningAttempt" ADD CONSTRAINT "ListeningAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningAttempt" ADD CONSTRAINT "ListeningAttempt_listeningExerciseId_fkey" FOREIGN KEY ("listeningExerciseId") REFERENCES "ListeningExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingAttempt" ADD CONSTRAINT "SpeakingAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentImport" ADD CONSTRAINT "ContentImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedLesson" ADD CONSTRAINT "GeneratedLesson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedLesson" ADD CONSTRAINT "GeneratedLesson_contentImportId_fkey" FOREIGN KEY ("contentImportId") REFERENCES "ContentImport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
