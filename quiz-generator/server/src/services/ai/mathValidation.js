const TOKEN_PATTERN = /\s*(\d+(?:\.\d+)?|[()+\-*/^%])\s*/g;

function normalizeExpression(expression) {
  let normalized = String(expression ?? "")
    .replace(/[\u00d7x]/gi, "*")
    .replace(/\u00f7/g, "/")
    .replace(/\u2212/g, "-")
    .replace(/,/g, "")
    .replace(/\s*=\s*\??\s*$/, "")
    .replace(/\s+\??\s*$/, "")
    .replace(/\s+[a-zA-Z\u00b0]+\s*$/, "")
    .trim();
  return normalized.replace(/(\d+(?:\.\d+)?)\s*%/g, "($1/100)");
}

function parseNumericValue(value) {
  const text = String(value ?? "").trim().replace(/,/g, "")
    .replace(/^[^=]*=\s*/, "")
    .replace(/\s*(?:[a-zA-Z\u00b0]+|%|units?)\s*$/i, "").trim();
  if (/^-?\d+(?:\.\d+)?\s*\/\s*-?\d+(?:\.\d+)?$/.test(text)) {
    const [numerator, denominator] = text.split("/").map(Number);
    return denominator === 0 ? null : numerator / denominator;
  }
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function solveArithmeticExpression(expression) {
  const normalized = normalizeExpression(expression);
  const tokens = normalized.match(TOKEN_PATTERN)?.map((value) => value.trim()).filter(Boolean);
  if (!tokens || tokens.join("") !== normalized.replace(/\s/g, "")) return null;
  const values = [];
  const operators = [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3, "u-": 4 };
  const apply = () => {
    const operator = operators.pop();
    if (operator === "u-") {
      const value = values.pop();
      if (value === undefined) return false;
      values.push(-value);
      return true;
    }
    const right = values.pop();
    const left = values.pop();
    if (left === undefined || right === undefined || (operator === "/" && right === 0)) return false;
    values.push(operator === "+" ? left + right : operator === "-" ? left - right : operator === "*" ? left * right : operator === "/" ? left / right : left ** right);
    return true;
  };
  let previous = null;
  for (const token of tokens) {
    if (/^\d/.test(token)) values.push(Number(token));
    else if (token === "(") operators.push(token);
    else if (token === ")") {
      while (operators.length && operators.at(-1) !== "(") if (!apply()) return null;
      if (operators.pop() !== "(") return null;
    } else {
      const unary = token === "-" && (previous === null || ["(", "+", "-", "*", "/", "^"].includes(previous));
      const operator = unary ? "u-" : token;
      while (operators.length && operators.at(-1) !== "(" && precedence[operators.at(-1)] >= precedence[operator]) if (!apply()) return null;
      operators.push(operator);
    }
    previous = token;
  }
  while (operators.length) if (!apply()) return null;
  return values.length === 1 && Number.isFinite(values[0]) ? values[0] : null;
}

export function validateMathQuestion(question) {
  const math = question.math;
  if (!math) return { valid: false, reason: "Math metadata is missing." };
  const expected = solveArithmeticExpression(math.expression);
  const unit = math.unit ?? "";
  const declared = parseNumericValue(math.solution || question.answer);
  const tolerance = Number(math.tolerance || 0);
  const independentlySolved = expected !== null && declared !== null && Math.abs(expected - declared) <= Math.max(tolerance, 0.000001);
  return { valid: independentlySolved && typeof unit === "string", independentlySolved, expected, declared, unit };
}
