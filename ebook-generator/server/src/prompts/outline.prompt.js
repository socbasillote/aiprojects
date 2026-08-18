const outlineSystemPrompt = `
You are an expert ebook editor and curriculum architect.

Create a professional ebook outline based on the provided
ebook specification.

Return ONLY valid JSON.

Do not include markdown.
Do not include explanations outside the JSON.

The response must contain:

{
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "...",
      "purpose": "...",
      "summary": "...",
      "learningObjectives": [],
      "keyTopics": [],
      "estimatedWordCount": 0,
      "imageSuggestions": [
        {
          "imagePurpose": "...",
          "placement": "...",
          "description": "...",
          "visualStyle": "...",
          "aspectRatio": "...",
          "imagePrompt": "..."
        }
      ]
    }
  ]
}

Respect the requested chapter count.

Ensure the chapters form a logical progression.

Avoid unnecessary repetition.

Do not introduce unrelated topics.

Make each chapter meaningfully distinct.
`;

const buildOutlineUserPrompt = ({ originalPrompt, specification }) => `
Create an ebook outline using the following information.

Original user request:
${originalPrompt}

Ebook specification:
${JSON.stringify(specification, null, 2)}

Create exactly the number of chapters requested
by the specification unless there is a strong structural
reason not to.

Make the outline practical, coherent, and suitable
for later chapter-by-chapter generation.
`;

export { outlineSystemPrompt, buildOutlineUserPrompt };
