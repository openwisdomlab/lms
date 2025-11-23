"use client";

import React, { useState } from "react";
import {
  Brain,
  Flame,
  Target,
  Clock,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  BookOpen,
  FlaskConical,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type {
  LearningUnit,
  MasteryLevel,
  UserUnitProgress,
} from "@/types/database-v3";
import { masteryLevelConfig } from "@/types/database-v3";

// Mock daily review data
const mockDailyReview = [
  {
    id: "1",
    unit: {
      id: "u1",
      title: "Photosynthesis Basics",
      unit_type: "flashcard" as const,
      front_content: {
        question:
          "What is the primary product of the light-dependent reactions in photosynthesis?",
      },
      back_content: {
        answer: "ATP and NADPH",
        explanation:
          "The light-dependent reactions use light energy to produce ATP and NADPH, which are then used in the Calvin cycle to fix carbon dioxide into glucose.",
      },
      difficulty_score: 0.4,
      xp_reward: 10,
    },
    progress: {
      mastery_level: "practicing" as MasteryLevel,
      consecutive_correct: 2,
      review_interval_days: 3,
    },
  },
  {
    id: "2",
    unit: {
      id: "u2",
      title: "Mars Atmospheric Composition",
      unit_type: "flashcard" as const,
      front_content: {
        question: "What is the primary component of Mars atmosphere?",
      },
      back_content: {
        answer: "Carbon dioxide (CO2) - approximately 95%",
        explanation:
          "Mars has a thin atmosphere composed mainly of CO2 (95.3%), with small amounts of nitrogen (2.7%), argon (1.6%), and trace amounts of oxygen and water vapor.",
      },
      difficulty_score: 0.3,
      xp_reward: 10,
    },
    progress: {
      mastery_level: "familiar" as MasteryLevel,
      consecutive_correct: 4,
      review_interval_days: 7,
    },
  },
  {
    id: "3",
    unit: {
      id: "u3",
      title: "Closed-Loop Life Support",
      unit_type: "concept" as const,
      front_content: {
        question:
          "What are the main cycles in a bioregenerative life support system?",
      },
      back_content: {
        answer: "Water cycle, Carbon cycle, and Nitrogen cycle",
        explanation:
          "A bioregenerative life support system mimics Earth ecosystems by cycling water (filtration, condensation), carbon (plant photosynthesis, human respiration), and nitrogen (waste processing, plant uptake).",
      },
      difficulty_score: 0.6,
      xp_reward: 15,
    },
    progress: {
      mastery_level: "learning" as MasteryLevel,
      consecutive_correct: 0,
      review_interval_days: 1,
    },
  },
];

// Learning paths mock data
const mockPaths = [
  {
    id: "p1",
    title: "Mars Survival Fundamentals",
    description: "Essential knowledge for Mars colonization",
    units_completed: 12,
    total_units: 20,
    xp_earned: 180,
    estimated_hours: 4,
  },
  {
    id: "p2",
    title: "Data Science for Space Research",
    description: "Analyze telemetry and research data",
    units_completed: 5,
    total_units: 15,
    xp_earned: 75,
    estimated_hours: 6,
  },
];

// Flashcard component
interface FlashcardProps {
  unit: (typeof mockDailyReview)[0]["unit"];
  progress: (typeof mockDailyReview)[0]["progress"];
  onAnswer: (quality: number) => void;
  onSkip: () => void;
}

function Flashcard({ unit, progress, onAnswer, onSkip }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const masteryConfig = masteryLevelConfig[progress.mastery_level];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={masteryConfig.bgColor}>
            <span className={masteryConfig.color}>{masteryConfig.label}</span>
          </Badge>
          <span className="text-sm text-muted-foreground">
            Streak: {progress.consecutive_correct}
          </span>
        </div>
        <Badge variant="secondary">+{unit.xp_reward} XP</Badge>
      </div>

      {/* Flashcard */}
      <Card
        className={cn(
          "min-h-[300px] cursor-pointer transition-all duration-300",
          isFlipped ? "bg-emerald-50 dark:bg-emerald-950/20" : ""
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          {!isFlipped ? (
            <>
              <Brain className="w-8 h-8 text-muted-foreground mb-4" />
              <p className="text-xl text-center font-medium">
                {unit.front_content?.question}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Click to reveal answer
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
              <p className="text-xl text-center font-semibold text-emerald-700 dark:text-emerald-400">
                {unit.back_content?.answer}
              </p>
              <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
                {unit.back_content?.explanation}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Answer buttons */}
      {isFlipped && (
        <div className="flex gap-3 mt-4 justify-center">
          <Button
            variant="outline"
            className="flex-1 max-w-[150px] border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={() => onAnswer(1)}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Forgot
          </Button>
          <Button
            variant="outline"
            className="flex-1 max-w-[150px] border-amber-200 hover:bg-amber-50 hover:text-amber-600"
            onClick={() => onAnswer(3)}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Hard
          </Button>
          <Button
            variant="outline"
            className="flex-1 max-w-[150px] border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
            onClick={() => onAnswer(4)}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Good
          </Button>
          <Button
            className="flex-1 max-w-[150px] bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onAnswer(5)}
          >
            <Zap className="w-4 h-4 mr-2" />
            Easy
          </Button>
        </div>
      )}

      {!isFlipped && (
        <div className="flex justify-center mt-4">
          <Button variant="ghost" onClick={onSkip}>
            Skip for now
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Learning path card
interface PathCardProps {
  path: (typeof mockPaths)[0];
}

function PathCard({ path }: PathCardProps) {
  const progress = (path.units_completed / path.total_units) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">{path.title}</h3>
            <p className="text-sm text-muted-foreground">{path.description}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {path.units_completed} / {path.total_units} units
            </span>
            <span className="text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            {path.xp_earned} XP
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {path.estimated_hours}h left
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LearnPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  const dailyGoal = 10;
  const currentReview = mockDailyReview[currentIndex];

  const handleAnswer = (quality: number) => {
    setCompletedToday((prev) => prev + 1);
    if (currentIndex < mockDailyReview.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setReviewMode(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < mockDailyReview.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daily Learning</h1>
            <p className="text-muted-foreground">
              Bite-sized learning with spaced repetition
            </p>
          </div>
          {!reviewMode && (
            <Button onClick={() => setReviewMode(true)}>
              <Brain className="w-4 h-4 mr-2" />
              Start Daily Review
            </Button>
          )}
        </div>

        {/* Review mode */}
        {reviewMode ? (
          <div className="space-y-6">
            {/* Progress bar */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Daily Progress</span>
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {mockDailyReview.length} reviews
                </span>
              </div>
              <Progress
                value={((currentIndex + 1) / mockDailyReview.length) * 100}
                className="h-2"
              />
            </Card>

            {/* Current flashcard */}
            {currentReview && (
              <Flashcard
                unit={currentReview.unit}
                progress={currentReview.progress}
                onAnswer={handleAnswer}
                onSkip={handleSkip}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button variant="outline" onClick={() => setReviewMode(false)}>
                End Session
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">7</div>
                    <div className="text-sm text-muted-foreground">
                      Day Streak
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {completedToday}/{dailyGoal}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Daily Goal
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">47</div>
                    <div className="text-sm text-muted-foreground">
                      Units Mastered
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">1,240</div>
                    <div className="text-sm text-muted-foreground">
                      Total XP
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Due for review */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Due for Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDailyReview.map((item) => {
                    const config = masteryLevelConfig[item.progress.mastery_level];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {item.unit.unit_type === "flashcard" ? (
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Lightbulb className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium">{item.unit.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Interval: {item.progress.review_interval_days} days
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={config.bgColor}>
                          <span className={config.color}>{config.label}</span>
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Learning Paths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-violet-500" />
                  Learning Paths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockPaths.map((path) => (
                    <PathCard key={path.id} path={path} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mastery overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mastery Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-4">
                  {(Object.entries(masteryLevelConfig) as [MasteryLevel, typeof masteryLevelConfig[MasteryLevel]][]).map(
                    ([level, config]) => (
                      <div key={level} className="text-center">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full mx-auto flex items-center justify-center text-lg font-bold",
                            config.bgColor,
                            config.color
                          )}
                        >
                          {level === "mastered"
                            ? 47
                            : level === "proficient"
                            ? 23
                            : level === "familiar"
                            ? 18
                            : level === "practicing"
                            ? 12
                            : level === "learning"
                            ? 8
                            : 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {config.label}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
