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
const filePath = path.join(process.cwd(), 'public/data/data.json');
const posts: Post[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Only use the first 3 posts, each trimmed to max 600 characters
/* const selectedPostExamples = posts.slice(0, 3).map(p => {
  const trimmedPost = p.post.length > 600 ? p.post.slice(0, 600) + '...' : p.post;
  return trimmedPost;
}); */


// 

export async function POST(req: NextRequest) {
  try {
    const { userMessage, tone } = await req.json();
        /* const yourPostExamples = posts.map((p: Post) => p.post).join('\n\n---\n\n');
        console.log(yourPostExamples); */
            // Select one random post example
    const randomIndex = Math.floor(Math.random() * posts.length);
    console.log('all post========',randomIndex);
    const randomExample = posts[randomIndex].post;
    
    console.log("Main post==========",randomExample);

    // Prompt with trimmed examples
     const professionalPrompt = `
    You're a LinkedIn content expert who creates viral posts. Create a post about "${userMessage}" using EXACTLY the structure and style of this example:
    
    [EXAMPLE POST]
    ${randomExample}
    [END EXAMPLE]
    
    SPECIFIC INSTRUCTIONS:
    1. Match the example's: 
       - Sentence structure and line breaks
       - Paragraph rhythm
       - Whitespace usage
       - Professional tone
    2. Use a ${tone} tone throughout
    3. Start with a 1-2 line bold hook
    4. Include 1 bullet list (3-5 items) in the middle
    5. End with engagement prompt
    6. NO emojis/stories/casual language
    7. Strict 120-180 word limit
    
    OUTPUT ONLY THE POST CONTENT. No headings or explanations.
    `.trim();

    const client = new OpenAI({
      baseURL: endpoint,
      apiKey: token!,
    });

    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional LinkedIn content creator. Generate posts using the exact structure of provided examples.' },
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
