import { Router } from "express";

const router = Router();

const CHARACTER_PROMPTS: Record<string, string> = {
  larry:
    "You are Larry, a sharp and disciplined AI performance coach. You are direct, no-nonsense, and laser-focused on execution and results. Help users break tasks into clear action steps, hold them accountable, and push past resistance. Keep responses concise (2-4 sentences), motivating, and action-oriented. Never be harsh — be the strict mentor who believes in the user.",
  sensei:
    "You are Sensei, a wise and patient AI learning coach. You draw on psychology, philosophy, and neuroscience to help users understand themselves and grow intellectually. Ask thoughtful questions and offer illuminating perspectives. Be warm, reflective, and intellectually curious. Keep responses to 2-4 sentences.",
  "dr-neo":
    "You are Dr. Neo, a behavioral psychologist AI who specializes in understanding the human mind — dopamine loops, habit formation, and cognitive biases. Help users decode why they behave the way they do and offer science-backed strategies. Be analytical but compassionate. Use the trigger-behavior-reward framework. Keep responses to 2-4 sentences.",
  hassan:
    "You are Hassan, an energetic and motivating fitness coach AI. You specialize in using physical movement as a tool for mental transformation. Provide specific movement-based alternatives to replace digital habits. Be enthusiastic but realistic. Keep responses to 2-4 sentences.",
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
    "The next time you feel the urge to scroll, drop and do 10 push-ups. Seriously. Your body will thank you and the craving will pass.",
    "A 5-minute walk resets your nervous system better than any social media break. Motion creates emotion — get moving!",
    "Physical energy is the foundation of mental discipline. What's your body doing right now? Stand up and move!",
    "Every time you replace digital escape with movement, you're literally rewiring your brain. That's not motivation — that's science.",
  ],
};

router.post("/", async (req, res) => {
  const { characterId, messages } = req.body as {
    characterId: string;
    messages: Array<{ role: string; content: string }>;
  };

  const systemPrompt = CHARACTER_PROMPTS[characterId] ?? CHARACTER_PROMPTS.larry;

  const apiKey =
    process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] ??
    process.env["OPENAI_API_KEY"];

  const baseUrl =
    process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] ??
    "https://api.openai.com/v1";

  if (apiKey) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-5.4",
          max_completion_tokens: 256,
          messages: [
            { role: "system", content: systemPrompt },
            ...(messages ?? []),
          ],
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          choices: Array<{ message: { content: string } }>;
        };
        const reply = data.choices[0]?.message?.content ?? "...";
        res.json({ reply });
        return;
      }
    } catch {
      // fall through to fallback
    }
  }

  // Fallback responses when no API key is available
  const pool = FALLBACK_RESPONSES[characterId] ?? FALLBACK_RESPONSES.larry;
  const reply = pool[Math.floor(Math.random() * pool.length)];
  res.json({ reply });
});

export default router;
