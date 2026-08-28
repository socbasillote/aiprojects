import RichTextRenderer from "./RichTextRenderer";
import { PAPER_STYLES } from "../paperStyles";

/* function MultipleChoiceAnswers({ options = [] }) {
  return (
    <div className="mt-3 space-y-2 pl-5 text-sm">
      {options.map((option, index) => (
        <div key={option.id} className="flex items-start gap-2">
          <span className="shrink-0">☐</span>

          <span className="min-w-0">
            {String.fromCharCode(65 + index)}. {option.text}
          </span>
        </div>
      ))}
    </div>
  );
}

function TrueFalseAnswers() {
  return (
    <div className="mt-3 flex gap-8 pl-5 text-sm">
      <span>☐ True</span>

      <span>☐ False</span>
    </div>
  );
}

function AnswerLines({ count = 1 }) {
  return (
    <div className="mt-3 space-y-2 pl-5">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border-b border-slate-300" />
      ))}
    </div>
  );
}

function QuestionAnswerArea({ question }) {
  switch (question.type) {
    case "multiple_choice":
      return <MultipleChoiceAnswers options={question.options} />;

    case "true_false":
      return <TrueFalseAnswers />;

    case "short_answer":
      return <AnswerLines count={1} />;

    case "fill_in_the_blank":
      return <AnswerLines count={1} />;

    case "essay":
      return <AnswerLines count={5} />;

    default:
      return null;
  }
} */

function QuestionAnswerArea({ question }) {
  if (!question) {
    return null;
  }

  if (question.type === "multiple_choice") {
    return (
      <div
        className="space-y-1.5"
        style={{
          marginTop: PAPER_STYLES.options.marginTop,
          paddingLeft: PAPER_STYLES.options.paddingLeft,
        }}
      >
        {question.options?.map((option, index) => (
          <div
            key={option.id}
            className="flex items-start gap-2"
            style={{
              lineHeight: PAPER_STYLES.options.lineHeight,
            }}
          >
            <span className="shrink-0">☐</span>

            <span>
              {String.fromCharCode(65 + index)}. {option.text}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (question.type === "true_false") {
    return (
      <div
        className="flex gap-8"
        style={{
          marginTop: PAPER_STYLES.options.marginTop,
          paddingLeft: PAPER_STYLES.options.paddingLeft,
        }}
      >
        <span>☐ True</span>

        <span>☐ False</span>
      </div>
    );
  }

  if (question.type === "short_answer") {
    return (
      <div
        className="space-y-2"
        style={{
          marginTop: PAPER_STYLES.answerLines.marginTop,
        }}
      >
        <div className="border-b border-slate-300" />
        <div className="border-b border-slate-300" />
      </div>
    );
  }

  if (question.type === "fill_in_the_blank") {
    return (
      <div
        className="border-b border-slate-300"
        style={{
          marginTop: PAPER_STYLES.answerLines.marginTop,
        }}
      >
        &nbsp;
      </div>
    );
  }

  if (question.type === "essay") {
    return (
      <div
        className="space-y-2"
        style={{
          marginTop: PAPER_STYLES.answerLines.marginTop,
        }}
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="border-b border-slate-300" />
        ))}
      </div>
    );
  }

  return null;
}

export default function PaperQuestion({ question, number }) {
  if (!question) {
    return null;
  }

  return (
    <article
      className="break-inside-avoid"
      style={{
        marginBottom: PAPER_STYLES.question.marginBottom,
        fontFamily: PAPER_STYLES.fontFamily,
        fontSize: PAPER_STYLES.body.fontSize,
        lineHeight: PAPER_STYLES.body.lineHeight,
      }}
    >
      <div className="flex items-start">
        <span
          className="shrink-0"
          style={{
            width: PAPER_STYLES.question.numberWidth,
            fontWeight: PAPER_STYLES.question.numberWeight,
          }}
        >
          {number}.
        </span>

        <div className="min-w-0 flex-1">
          <RichTextRenderer content={question.content} />

          <QuestionAnswerArea question={question} />
        </div>
      </div>
    </article>
  );
}
