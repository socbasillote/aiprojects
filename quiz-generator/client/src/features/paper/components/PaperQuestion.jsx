import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import QuestionContentEditor from "../../editor/components/QuestionContentEditor";
import {
  selectQuestion,
  updateOption,
  updateQuestion,
} from "../../editor/editorSlice";
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

function QuestionAnswerArea({
  question,
  isEditing,
  onStartEditing,
  onOptionChange,
  onAnswerChange,
}) {
  if (!question) {
    return null;
  }

  if (question.type === "multiple_choice") {
    return (
      <div
        className="space-y-1.5"
        onClick={!isEditing ? onStartEditing : undefined}
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

            {isEditing ? (
              <input
                type="text"
                value={option.text}
                onChange={(event) =>
                  onOptionChange(option.id, event.target.value)
                }
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                aria-label={`Option ${String.fromCharCode(65 + index)}`}
                className="min-w-0 flex-1 border-b border-slate-300 bg-transparent outline-none focus:border-sky-500"
              />
            ) : (
              <span>
                {String.fromCharCode(65 + index)}. {option.text}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (question.type === "true_false") {
    return (
      <div
        className="flex gap-8"
        onClick={!isEditing ? onStartEditing : undefined}
        style={{
          marginTop: PAPER_STYLES.options.marginTop,
          paddingLeft: PAPER_STYLES.options.paddingLeft,
        }}
      >
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={() => onAnswerChange(true)}
              className="text-left"
            >
              {question.answer === true ? "◉" : "○"} True
            </button>

            <button
              type="button"
              onClick={() => onAnswerChange(false)}
              className="text-left"
            >
              {question.answer === false ? "◉" : "○"} False
            </button>
          </>
        ) : (
          <>
            <span>☐ True</span>
            <span>☐ False</span>
          </>
        )}
      </div>
    );
  }

  if (question.type === "short_answer") {
    return (
      <div
        className="space-y-2"
        onClick={!isEditing ? onStartEditing : undefined}
        style={{
          marginTop: PAPER_STYLES.answerLines.marginTop,
        }}
      >
        {isEditing ? (
          <input
            type="text"
            value={question.answer ?? ""}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder="Enter the answer"
            className="w-full border-b border-slate-300 bg-transparent outline-none focus:border-sky-500"
          />
        ) : (
          <>
            <div className="border-b border-slate-300" />
            <div className="border-b border-slate-300" />
          </>
        )}
      </div>
    );
  }

  if (question.type === "fill_in_the_blank") {
    return (
      <div
        className="border-b border-slate-300"
        onClick={!isEditing ? onStartEditing : undefined}
        style={{
          marginTop: PAPER_STYLES.answerLines.marginTop,
        }}
      >
        {isEditing ? (
          <input
            type="text"
            value={question.answer ?? ""}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder="Enter the answer"
            className="w-full bg-transparent outline-none"
          />
        ) : (
          "\u00a0"
        )}
      </div>
    );
  }

  if (question.type === "essay") {
    return (
      <div
        className="space-y-2"
        onClick={!isEditing ? onStartEditing : undefined}
        style={{
          marginTop: PAPER_STYLES.answerLines.marginTop,
        }}
      >
        {isEditing ? (
          <textarea
            value={question.answer ?? ""}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder="Enter the answer or grading guidance"
            rows={5}
            className="w-full resize-y border border-slate-300 bg-transparent p-2 outline-none focus:border-sky-500"
          />
        ) : (
          Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="border-b border-slate-300" />
          ))
        )}
      </div>
    );
  }

  return null;
}

function getAnswerKeyLabel(question) {
  if (question.type === "multiple_choice") {
    const answerOption = question.options?.find(
      (option) => option.id === question.answer || option.correct,
    );

    if (!answerOption) {
      return "Not provided";
    }

    const optionIndex = question.options.indexOf(answerOption);

    return `${String.fromCharCode(65 + optionIndex)}. ${answerOption.text}`;
  }

  if (question.type === "true_false") {
    if (
      question.answer === true ||
      String(question.answer).toLowerCase() === "true"
    ) {
      return "True";
    }

    if (
      question.answer === false ||
      String(question.answer).toLowerCase() === "false"
    ) {
      return "False";
    }
  }

  return question.answer || "Not provided";
}

function hasQuestionContent(content) {
  return Boolean(
    content?.content?.some(
      (node) => node.type === "image" || node.content?.length > 0,
    ),
  );
}

export default function PaperQuestion({
  question,
  number,
  showAnswerKey = false,
  onEditorReady,
}) {
  const dispatch = useDispatch();
  const selectedQuestionId = useSelector(
    (state) => state.editor.selectedQuestionId,
  );
  const [editingLayoutContent, setEditingLayoutContent] = useState(
    () => question?.content,
  );
  const isEditing = selectedQuestionId === question.id;

  useEffect(() => {
    if (!isEditing) {
      onEditorReady?.(null);
    }
  }, [isEditing, onEditorReady]);

  if (!question) {
    return null;
  }

  function handleSelect() {
    dispatch(selectQuestion(question.id));
  }

  function handleOptionChange(optionId, text) {
    dispatch(
      updateOption({
        questionId: question.id,
        optionId,
        changes: { text },
      }),
    );
  }

  function handleAnswerChange(answer) {
    dispatch(
      updateQuestion({
        id: question.id,
        changes: { answer },
      }),
    );
  }

  function startEditing() {
    setEditingLayoutContent(question.content);
    handleSelect();
  }

  return (
    <article
      data-paper-question
      className={`relative break-inside-avoid ${
        selectedQuestionId === question.id
          ? "ring-2 ring-sky-400 ring-offset-2"
          : ""
      }`}
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
          {isEditing ? (
            <div className="relative">
              <div aria-hidden="true" className="invisible min-h-6">
                <RichTextRenderer content={editingLayoutContent} />
              </div>

              <QuestionContentEditor
                content={question.content}
                showToolbar={false}
                paperOverlay
                placeholderText="Add question text"
                onEditorReady={onEditorReady}
                onChange={(content) =>
                  dispatch(
                    updateQuestion({
                      id: question.id,
                      changes: { content },
                    }),
                  )
                }
              />
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                startEditing();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  startEditing();
                }
              }}
              className="block w-full cursor-text text-left"
            >
              {hasQuestionContent(question.content) ? (
                <RichTextRenderer content={question.content} />
              ) : (
                <span className="text-slate-400">Add question text</span>
              )}
            </div>
          )}

          <QuestionAnswerArea
            question={question}
            isEditing={isEditing}
            onStartEditing={startEditing}
            onOptionChange={handleOptionChange}
            onAnswerChange={handleAnswerChange}
          />

          {showAnswerKey && (
            <div className="mt-3 text-xs font-semibold text-slate-500">
              Answer key: {getAnswerKeyLabel(question)}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
