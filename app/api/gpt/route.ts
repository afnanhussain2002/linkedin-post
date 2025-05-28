import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';

interface Post {
  id: number;
  post: string;
}

const token = process.env.GITHUB_TOKEN;
const endpoint = 'https://models.github.ai/inference';
const modelName = 'openai/gpt-4o';

// Load and parse JSON file with post examples
const filePath = path.join(process.cwd(), '/public/data/data.json');
const fileContent = fs.readFileSync(filePath, 'utf8');
const posts = JSON.parse(fileContent);

// Only use the first 3 posts, each trimmed to max 600 characters
/* const selectedPostExamples = posts.slice(0, 3).map(p => {
  const trimmedPost = p.post.length > 600 ? p.post.slice(0, 600) + '...' : p.post;
  return trimmedPost;
}); */


// 

export async function POST(req: NextRequest) {
  try {
    const { userMessage, tone } = await req.json();
        const yourPostExamples = posts.map((p: Post) => p.post).join('\n\n---\n\n');
        console.log(yourPostExamples);

    // Prompt with trimmed examples
    const professionalPrompt = `
You are a top-tier LinkedIn content strategist with expertise in writing high-performing posts for professionals.

Below are examples of real LinkedIn posts that went viral.
Study their structure, tone, formatting, and use of whitespace:

[START OF EXAMPLES]
${yourPostExamples}
[END OF EXAMPLES]

Now, write a LinkedIn post based on the following user input, follow a random post structure from the examples above:
"${userMessage}"

Use a ${tone} tone. Do not write a story. Instead, write an insight-driven post that shares actionable value.

Follow these rules base on post structure:

1. Start with a **short, bold hook** (1–2 lines) that captures attention.

2. Write in a **professional, confident, and clear** tone — similar to a leadership coach or industry expert.

3. **Keep each sentence under 74 characters.**

4. **Each sentence should be its own line.** Use ample whitespace.

5. Include **one bullet list** (3–6 items) in the middle of the post with concise tips, values, or leadership insights.

6. **Do not include emojis** or casual expressions. Avoid fluff.

7. Keep the post between **120–180 words**.

8. End with a **strong insight, call-to-action, or reflective question** to boost engagement.

9. Your job is to **reframe any topic** so it feels relevant to ambitious professionals, leaders, or job seekers.

Only return the final LinkedIn post. No explanations, headings, or notes.
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
      max_tokens: 8000,
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
