const VISUAL_SUBJECTS = ["science", "biology", "geography"];
const VISUAL_TOPICS = [
  "vocabulary",
  "preposition",
  "map",
  "anatomy",
  "ecosystem",
  "earth",
  "weather",
];
const MATH_VISUAL_TOPICS = [
  "geometry",
  "fraction",
  "graph",
  "coordinate",
  "visual word problem",
];
const MATH_TOPICS = [
  "arithmetic",
  "algebra",
  "equation",
  "number",
  "calculation",
];

function includesAny(value, terms) {
  return terms.some((term) => value.includes(term));
}

export function planQuestionContent({
  subject = "",
  topic = "",
  gradeLevel = "",
  difficulty = "medium",
  contentMode = "text",
}) {
  const subjectText = subject.trim().toLowerCase();
  const topicText = topic.trim().toLowerCase();
  const visualUseful =
    includesAny(subjectText, VISUAL_SUBJECTS) ||
    includesAny(topicText, VISUAL_TOPICS);
  const mathVisualUseful =
    subjectText.includes("math") && includesAny(topicText, MATH_VISUAL_TOPICS);
  const mathUseful =
    subjectText.includes("math") || includesAny(topicText, MATH_TOPICS);

  if (contentMode === "visual") {
    return {
      allowed: visualUseful || mathVisualUseful ? ["visual"] : ["text"],
      reason: `visual-request:${gradeLevel}:${difficulty}`,
    };
  }

  if (contentMode === "math") {
    return {
      allowed: mathUseful ? ["math"] : ["text"],
      reason: "math-request",
    };
  }

  if (contentMode === "mixed") {
    const allowed = ["text"];
    if (mathUseful) allowed.push("math");
    if (visualUseful || mathVisualUseful) allowed.push("visual");
    return { allowed, reason: `subject-topic-mix:${gradeLevel}:${difficulty}` };
  }

  return {
    allowed: mathUseful ? ["math", "text"] : ["text"],
    reason: "text-default",
  };
}

export function createMathSectionInstructions({ topic = "", solutionLayout = "top_to_bottom", instructions = "" }) {
  const topicText = topic.trim() || "each problem";
  const layoutText =
    solutionLayout === "top_to_bottom"
      ? "Solve each problem from top to bottom, showing every line of your solution."
      : solutionLayout === "multiplication_grid"
        ? "Format the paper as a 7-column by 10-row multiplication grid with vertical factors and an answer line under each problem."
        : "Solve each problem horizontally, showing your work clearly.";
  const customText = instructions.trim();

  return [
    `Solve the ${topicText} problems.`,
    layoutText,
    "Write the final answer with the correct unit when one is given.",
    customText,
  ].filter(Boolean).join("\n");
}
