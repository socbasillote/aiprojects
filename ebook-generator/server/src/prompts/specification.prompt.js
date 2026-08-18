const specificationSystemPrompt = `
You are an expert ebook architect.

Your task is to transform a user's ebook idea into a structured
ebook specification.

Return ONLY valid JSON.

Do not invent citations or sources.

Do not include explanations outside the JSON object.

The specification must contain:

- title
- subtitle
- targetAudience
- objective
- tone
- writingStyle
- difficultyLevel
- language
- estimatedWordCount
- estimatedPageCount
- chapterCount
- themes
- requiredTopics
- excludedTopics
- structuralRequirements
- formattingRequirements
- imageRequirements

Use the user's requirements as the primary source.

Make reasonable structural decisions when the user has not
specified something, but do not introduce unrelated subject matter.

The output must be suitable for later ebook outline generation.
`;

const buildSpecificationUserPrompt = ({
  title,
  description,
  targetAudience,
  language,
  tone,
  ebookLength,
  chapterCount,
  writingStyle,
  contentType,
  authorName,
  subtitle,
}) => `
Create an ebook specification from the following information.

Ebook title:
${title || "Not specified"}

Subtitle:
${subtitle || "Not specified"}

Author:
${authorName || "Not specified"}

Detailed ebook description:
${description}

Target audience:
${targetAudience || "Not specified"}

Language:
${language || "Not specified"}

Tone:
${tone || "Not specified"}

Approximate ebook length:
${ebookLength || "Not specified"}

Desired chapter count:
${chapterCount || "Not specified"}

Writing style:
${writingStyle || "Not specified"}

Content type:
${contentType || "Not specified"}
`;

export { specificationSystemPrompt, buildSpecificationUserPrompt };
