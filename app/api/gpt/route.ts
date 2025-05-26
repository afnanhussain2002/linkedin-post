import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const token = process.env.GITHUB_TOKEN;
const endpoint = 'https://models.github.ai/inference';
const modelName = 'openai/gpt-4o';

export async function POST(req: NextRequest) {
  try {
    const { userMessage, tone } = await req.json();

    // Professional LinkedIn post prompt
    const professionalPrompt = `
You are an expert LinkedIn content writer.

Take the following user input and write a professional LinkedIn post based on it:
"${userMessage}"

Use a ${tone} tone.

Follow these formatting and stylistic rules:

1. Start with an attention-grabbing hook.
2. Use a professional but warm tone throughout the post.
3. Each sentence should be no more than 74 characters.
4. Each line should contain 7 to 10 words.
5. Add a blank line after every sentence.
6. Include a bullet point list (3 to 5 items) with values, takeaways, or leadership lessons related to the input.
7. Do not use emojis anywhere in the post.
8. Reframe the input so it resonates with professionals, leaders, and job seekers.
9. End with a reflection or CTA that invites engagement.
10. Keep the post between 120 to 180 words.
11. Use correct grammar and avoid slang or casual expressions.

Generate only the LinkedIn post as final output.
    `.trim();

    const client = new OpenAI({
      baseURL: endpoint,
      apiKey: token!,
    });

    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: professionalPrompt },
      ],
      model: modelName,
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 1000,
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
