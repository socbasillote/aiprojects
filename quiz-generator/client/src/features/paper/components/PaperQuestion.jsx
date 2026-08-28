import RichTextRenderer from "./RichTextRenderer";

export default function PaperQuestion({ question, number }) {
  return (
    <article className="break-inside-avoid">
      <div className="flex items-start gap-2">
        <span className="shrink-0 text-sm font-semibold leading-6">
          {number}.
        </span>

        <div className="min-w-0 flex-1 text-sm leading-6">
          <RichTextRenderer content={question.content} />

          <QuestionAnswerArea question={question} />
        </div>
      </div>
    </article>
  );
}

function QuestionAnswerArea({ question }) {
  switch (question.type) {
    case "multiple_choice":
      return <MultipleChoice question={question} />;

    case "true_false":
      return <TrueFalse />;

    case "short_answer":
      return <AnswerLines lines={2} />;

    case "fill_in_the_blank":
      return <AnswerLines lines={1} />;

    case "essay":
      return <AnswerLines lines={6} />;

    default:
      return null;
  }
}

function MultipleChoice({ question }) {
  return (
    <div className="mt-3 space-y-2 pl-2">
      {(question.options || []).map((option, index) => (
        <div key={option.id} className="flex items-start gap-2">
          <span className="shrink-0">☐</span>

          <span>
            {String.fromCharCode(65 + index)}. {option.text}
          </span>
        </div>
      ))}
    </div>
  );
}

function TrueFalse() {
  return (
    <div className="mt-3 flex gap-8">
      <span>☐ True</span>
      <span>☐ False</span>
    </div>
  );
}

function AnswerLines({ lines }) {
  return (
    <div className="mt-4 space-y-4">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="border-b border-slate-300" />
      ))}
    </div>
  );
}
