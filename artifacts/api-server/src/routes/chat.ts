import { Router } from "express";

const router = Router();

const CHARACTER_PROMPTS: Record<string, string> = {
  larry:
    "You are Larry, a sharp and disciplined AI performance coach. You are direct, no-nonsense, and laser-focused on execution and results. Help users break tasks into clear action steps, hold them accountable, and push past resistance. Keep responses concise (2-4 sentences), motivating, and action-oriented. Never be harsh — be the strict mentor who believes in the user. Do not use bullet points or markdown formatting. Speak in plain, punchy sentences.",
  sensei:
    "You are Sensei, a wise and patient AI learning coach. You draw on psychology, philosophy, and neuroscience to help users understand themselves and grow intellectually. Ask thoughtful questions and offer illuminating perspectives. Be warm, reflective, and intellectually curious. Keep responses to 2-4 sentences. Do not use bullet points or markdown. Speak in flowing, thoughtful prose.",
  "dr-neo":
    "You are Dr. Neo, a behavioral psychologist AI who specializes in understanding the human mind — dopamine loops, habit formation, and cognitive biases. Help users decode why they behave the way they do and offer science-backed strategies. Be analytical but compassionate. Use the trigger-behavior-reward framework. Keep responses to 2-4 sentences. No bullet points or markdown — speak in clear analytical sentences.",
  hassan:
    "You are Hassan, an energetic and motivating fitness coach AI. You specialize in using physical movement as a tool for mental transformation. Provide specific movement-based alternatives to replace digital habits. Be enthusiastic but realistic. Keep responses to 2-4 sentences. No bullet points or markdown. Be direct and energetic.",
};

const FALLBACK_RESPONSES: Record<string, string[]> = {
  larry: [
    "Focus on one task. Write it down. Do it now. The hardest part is starting — everything else follows.",
    "Stop waiting for the perfect moment. That moment is now. What's the smallest step you can take in the next 5 minutes?",
    "Discipline is not about restriction — it's about direction. Where do you want to go today?",
    "Break it into three steps. Do the first one. The momentum will carry you through the rest.",
  ],
  sensei: [
    "Awareness is the first step to change. What pattern are you noticing in yourself right now?",
    "The mind that seeks to understand itself is already halfway to wisdom. What brought you here today?",
    "Every habit was once a choice that became automatic. Understanding the original choice is the key to changing the habit.",
    "Knowledge without action is just information. What insight can you act on, even in a small way, right now?",
  ],
  "dr-neo": [
    "Every behavior follows a trigger → routine → reward loop. What's triggering the pattern you want to change?",
    "The brain doesn't distinguish between good and bad habits — it just optimizes for reward. We need to change the reward, not just the behavior.",
    "Willpower is a limited resource. The goal is to design your environment so the right behavior becomes the path of least resistance.",
    "Awareness of a pattern is the first intervention. Now that you see it, you can begin to redirect it.",
  ],
  hassan: [
    "The next time you feel the urge to scroll, drop and do 10 push-ups. Your body will thank you and the craving will pass.",
    "A 5-minute walk resets your nervous system better than any social media break. Motion creates emotion — get moving!",
    "Physical energy is the foundation of mental discipline. What's your body doing right now? Stand up and move!",
    "Every time you replace digital escape with movement, you're literally rewiring your brain. That's not motivation — that's science.",
  ],
};

interface UserContext {
  userName: string;
  xp: number;
  streak: number;
  stage: number;
  successPct: number;
  todayTasksTotal: number;
  todayTasksCompleted: number;
  pendingTasksToday: string[];
  completedTasksToday: string[];
  allPendingTasks: string[];
  totalHabits: number;
  habitsCheckedToday: number;
  habitsMissedToday: { cue: string; replace: string; with: string; streak: number }[];
  habitsOnStreak: { replace: string; streak: number }[];
}

function buildContextBlock(ctx: UserContext, characterId: string): string {
  const stageLabels = ["", "Beginner", "Developing", "Advanced", "Master"];
  const stageLabel = stageLabels[ctx.stage] ?? "Beginner";

  const lines: string[] = [
    `\n\n--- USER DATA (use this to personalize your response) ---`,
    `Name: ${ctx.userName}`,
    `XP: ${ctx.xp} | Streak: ${ctx.streak} day${ctx.streak !== 1 ? "s" : ""} | Stage: ${stageLabel} (${ctx.stage}/4)`,
    `Today's success index: ${ctx.successPct}% (${ctx.todayTasksCompleted}/${ctx.todayTasksTotal} tasks done, ${ctx.habitsCheckedToday}/${ctx.totalHabits} habits checked)`,
  ];

  if (ctx.pendingTasksToday.length > 0) {
    lines.push(`Pending tasks today: ${ctx.pendingTasksToday.join(", ")}`);
  } else if (ctx.todayTasksTotal === 0) {
    lines.push(`No tasks added today yet.`);
  } else {
    lines.push(`All tasks completed today — great execution!`);
  }

  if (ctx.completedTasksToday.length > 0) {
    lines.push(`Completed today: ${ctx.completedTasksToday.join(", ")}`);
  }

  if (ctx.allPendingTasks.length > 0 && ctx.pendingTasksToday.length === 0) {
    lines.push(`Older pending tasks: ${ctx.allPendingTasks.join(", ")}`);
  }

  if (ctx.habitsOnStreak.length > 0) {
    const streaks = ctx.habitsOnStreak
      .map((h) => `"${h.replace}" (${h.streak}d streak)`)
      .join(", ");
    lines.push(`Habits checked today: ${streaks}`);
  }

  if (ctx.habitsMissedToday.length > 0) {
    const missed = ctx.habitsMissedToday
      .map((h) => `"${h.replace}" (trigger: ${h.cue}, streak: ${h.streak}d)`)
      .join(", ");
    lines.push(`Habits NOT checked today: ${missed}`);
  }

  if (ctx.totalHabits === 0) {
    lines.push(`No habits set up yet.`);
  }

  // Character-specific guidance on how to use the data
  const guidance: Record<string, string> = {
    larry:
      "Use this data to call out what's not done, push the user to complete pending tasks, acknowledge wins, and hold them accountable with direct language.",
    sensei:
      "Use this data to reflect on patterns, question what's blocking progress, and offer wisdom about the user's journey and habits.",
    "dr-neo":
      "Analyze the habit patterns and task completion data as behavioral evidence. Reference specific habits and their triggers to explain the user's behavior loops.",
    hassan:
      "Use the habit and task data to recommend physical actions that directly replace the missed habits or support the pending tasks with energy and movement.",
  };

  lines.push(`\nYour role with this data: ${guidance[characterId] ?? guidance.larry}`);
  lines.push(`--- END USER DATA ---`);

  return lines.join("\n");
}

router.post("/", async (req, res) => {
  const { characterId, messages, userContext } = req.body as {
    characterId: string;
    messages: Array<{ role: string; content: string }>;
    userContext?: UserContext;
  };

  const basePrompt = CHARACTER_PROMPTS[characterId] ?? CHARACTER_PROMPTS.larry;
  const contextBlock = userContext ? buildContextBlock(userContext, characterId) : "";
  const systemPrompt = basePrompt + contextBlock;

  const apiKey = process.env["GEMINI_API_KEY"];

  if (apiKey) {
    try {
      const geminiMessages = (messages ?? []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: geminiMessages,
            generationConfig: {
              maxOutputTokens: 300,
              temperature: 0.9,
            },
          }),
        }
      );

      if (response.ok) {
        const data = (await response.json()) as {
          candidates: Array<{
            content: { parts: Array<{ text: string }> };
          }>;
        };
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "...";
        res.json({ reply });
        return;
      } else {
        const err = await response.text();
        console.error("Gemini API error:", response.status, err);
      }
    } catch (e) {
      console.error("Gemini fetch error:", e);
    }
  }

  // Fallback when no API key or request fails
  const pool = FALLBACK_RESPONSES[characterId] ?? FALLBACK_RESPONSES.larry;
  const reply = pool[Math.floor(Math.random() * pool.length)];
  res.json({ reply });
});

export default router;
