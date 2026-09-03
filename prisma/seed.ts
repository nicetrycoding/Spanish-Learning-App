import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { VOCABULARY } from "./seed-data/vocabulary";
import { GRAMMAR_TOPICS } from "./seed-data/grammar";
import { CURRICULUM } from "./seed-data/curriculum";
import { LISTENING_EXERCISES } from "./seed-data/listening";
import { ROLEPLAY_CHARACTERS } from "./seed-data/characters";
import { STORIES } from "./seed-data/stories";
import { ACHIEVEMENTS } from "./seed-data/achievements";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Spanish Learning Platform...\n");

  // ---- Content: curriculum (CourseLevel > Module > Lesson > Exercise) ----
  for (const level of CURRICULUM) {
    const courseLevel = await prisma.courseLevel.upsert({
      where: { level: level.level },
      create: { level: level.level, title: level.title, description: level.description, order: level.order },
      update: { title: level.title, description: level.description, order: level.order },
    });

    for (const mod of level.modules) {
      const module_ = await prisma.module.upsert({
        where: { slug: mod.slug },
        create: { slug: mod.slug, title: mod.title, description: mod.description, order: mod.order, courseLevelId: courseLevel.id },
        update: { title: mod.title, description: mod.description, order: mod.order, courseLevelId: courseLevel.id },
      });

      for (const lesson of mod.lessons) {
        const lessonRow = await prisma.lesson.upsert({
          where: { slug: lesson.slug },
          create: {
            slug: lesson.slug,
            title: lesson.title,
            type: lesson.type,
            order: lesson.order,
            explanation: lesson.explanation,
            examples: lesson.examples,
            cefrLevel: level.level,
            skillTags: lesson.skillTags,
            estimatedMinutes: lesson.estimatedMinutes,
            moduleId: module_.id,
          },
          update: {
            title: lesson.title,
            type: lesson.type,
            order: lesson.order,
            explanation: lesson.explanation,
            examples: lesson.examples,
            skillTags: lesson.skillTags,
            estimatedMinutes: lesson.estimatedMinutes,
          },
        });

        // Exercises are re-created idempotently: clear and re-insert for this lesson.
        await prisma.exercise.deleteMany({ where: { lessonId: lessonRow.id } });
        for (const exercise of lesson.exercises) {
          await prisma.exercise.create({
            data: {
              lessonId: lessonRow.id,
              type: exercise.type,
              cefrLevel: level.level,
              skillTag: exercise.skillTag,
              difficulty: exercise.difficulty,
              prompt: exercise.prompt,
              data: exercise.data,
              explanation: exercise.explanation,
              stage: exercise.stage ?? "independent_practice",
            },
          });
        }
      }
    }
  }
  console.log(`✓ Curriculum: ${CURRICULUM.length} levels`);

  // ---- Vocabulary ----
  for (const v of VOCABULARY) {
    await prisma.vocabulary.upsert({
      where: { spanish_translation: { spanish: v.spanish, translation: v.translation } },
      create: v,
      update: v,
    });
  }
  console.log(`✓ Vocabulary: ${VOCABULARY.length} words`);

  // ---- Grammar topics ----
  for (const g of GRAMMAR_TOPICS) {
    await prisma.grammarTopic.upsert({ where: { slug: g.slug }, create: g, update: g });
  }
  console.log(`✓ Grammar: ${GRAMMAR_TOPICS.length} topics`);

  // ---- Listening exercises ----
  const existingListening = await prisma.listeningExercise.count();
  if (existingListening === 0) {
    await prisma.listeningExercise.createMany({ data: LISTENING_EXERCISES as never[] });
  }
  console.log(`✓ Listening: ${LISTENING_EXERCISES.length} exercises`);

  // ---- Roleplay characters ----
  for (const c of ROLEPLAY_CHARACTERS) {
    await prisma.roleplayCharacter.upsert({ where: { slug: c.slug }, create: c, update: c });
  }
  console.log(`✓ Characters: ${ROLEPLAY_CHARACTERS.length}`);

  // ---- Stories ----
  for (const s of STORIES) {
    const story = await prisma.story.upsert({
      where: { slug: s.slug },
      create: { slug: s.slug, title: s.title, description: s.description, cefrLevel: s.cefrLevel, region: s.region, startStepKey: s.startStepKey },
      update: { title: s.title, description: s.description, cefrLevel: s.cefrLevel, region: s.region, startStepKey: s.startStepKey },
    });
    for (const step of s.steps) {
      await prisma.storyStep.upsert({
        where: { storyId_stepKey: { storyId: story.id, stepKey: step.stepKey } },
        create: {
          storyId: story.id,
          stepKey: step.stepKey,
          speaker: step.speaker,
          textEs: step.textEs,
          textEn: step.textEn,
          choices: step.choices,
          isEnding: step.isEnding ?? false,
          vocabHighlights: step.vocabHighlights ?? [],
        },
        update: {
          speaker: step.speaker,
          textEs: step.textEs,
          textEn: step.textEn,
          choices: step.choices,
          isEnding: step.isEnding ?? false,
          vocabHighlights: step.vocabHighlights ?? [],
        },
      });
    }
  }
  console.log(`✓ Stories: ${STORIES.length}`);

  // ---- Achievements ----
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({ where: { key: a.key }, create: a, update: a });
  }
  console.log(`✓ Achievements: ${ACHIEVEMENTS.length}`);

  // ---- Demo user ----
  const demoEmail = "demo@sendero.app";
  const passwordHash = await bcrypt.hash("Demo1234", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    create: { email: demoEmail, name: "Demo Learner", passwordHash },
    update: {},
  });

  await prisma.profile.upsert({
    where: { userId: demoUser.id },
    create: {
      userId: demoUser.id,
      onboardingCompleted: true,
      selfReportedLevel: "B1",
      region: "MEXICO",
      dailyGoalMinutes: 15,
      focusAreas: ["GRAMMAR", "LISTENING"],
      immersionLevel: "SPANISH_AND_ENGLISH",
      correctionStyle: "after",
    },
    update: {},
  });

  await prisma.skillProfile.upsert({
    where: { userId: demoUser.id },
    create: {
      userId: demoUser.id,
      overallLevel: "B1",
      overallSub: 0.4,
      grammarLevel: "B1",
      grammarSub: 0.2,
      vocabularyLevel: "B1",
      vocabularySub: 0.6,
      readingLevel: "B1",
      readingSub: 0.5,
      listeningLevel: "A2",
      listeningSub: 0.7,
      writingLevel: "B1",
      writingSub: 0.1,
      speakingLevel: "A2",
      speakingSub: 0.5,
    },
    update: {},
  });

  await prisma.userProgress.upsert({
    where: { userId: demoUser.id },
    create: {
      userId: demoUser.id,
      totalXp: 640,
      currentStreak: 4,
      longestStreak: 11,
      lastActivityDate: new Date(),
      lessonsCompleted: 6,
      exercisesCompleted: 58,
      wordsMastered: 12,
      studyMinutesTotal: 210,
    },
    update: {},
  });

  await prisma.userLearningGoal.deleteMany({ where: { userId: demoUser.id } });
  await prisma.userLearningGoal.createMany({
    data: [
      { userId: demoUser.id, goal: "CONVERSATION" },
      { userId: demoUser.id, goal: "TRAVEL" },
    ],
  });

  await prisma.userLevel.create({ data: { userId: demoUser.id, level: "B1", subLevel: 0.4, source: "manual_override" } });

  // Save a handful of vocabulary words at varying mastery for the demo account.
  const demoVocab = await prisma.vocabulary.findMany({ take: 15 });
  for (const [i, v] of demoVocab.entries()) {
    const mastery = i < 5 ? 90 : i < 10 ? 55 : 15;
    await prisma.userVocabulary.upsert({
      where: { userId_vocabularyId: { userId: demoUser.id, vocabularyId: v.id } },
      create: {
        userId: demoUser.id,
        vocabularyId: v.id,
        status: mastery >= 85 ? "MASTERED" : mastery >= 40 ? "REVIEW" : "LEARNING",
        exposure: 80,
        understanding: mastery,
        accuracy: mastery,
        retention: mastery - 10 > 0 ? mastery - 10 : 0,
        production: mastery - 20 > 0 ? mastery - 20 : 0,
        mastery,
        repetitions: mastery >= 85 ? 4 : 1,
        nextReviewAt: new Date(Date.now() - (i % 3 === 0 ? 1000 * 60 * 60 * 24 : -1000 * 60 * 60 * 24 * 2)),
      },
      update: {},
    });
  }

  // A couple of recorded mistakes with review items, so Mistakes/Review pages have real content.
  const sampleExercise = await prisma.exercise.findFirst({ where: { skillTag: "GRAMMAR" } });
  if (sampleExercise) {
    const mistake = await prisma.mistake.upsert({
      where: { id: `demo-mistake-${demoUser.id}` },
      create: {
        id: `demo-mistake-${demoUser.id}`,
        userId: demoUser.id,
        category: "CONJUGATION",
        sourceType: "EXERCISE",
        sourceId: sampleExercise.id,
        userInput: "Yo soy 25 años.",
        correctForm: "Tengo 25 años.",
        explanation: "Spanish expresses age using 'tener', not 'ser'.",
        cefrLevel: "A1",
        occurrenceCount: 3,
      },
      update: {},
    });
    await prisma.reviewItem.upsert({
      where: { userId_itemType_refId: { userId: demoUser.id, itemType: "MISTAKE", refId: mistake.id } },
      create: {
        userId: demoUser.id,
        itemType: "MISTAKE",
        refId: mistake.id,
        mistakeId: mistake.id,
        dueAt: new Date(Date.now() - 1000 * 60 * 60),
        errorFrequency: 3,
        importance: 0.7,
      },
      update: {},
    });
  }

  console.log(`✓ Demo user ready: ${demoEmail} / Demo1234\n`);
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
