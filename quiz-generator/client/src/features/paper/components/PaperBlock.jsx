import PaperQuestion from "./PaperQuestion";
import PaperSection from "./PaperSection";

export default function PaperBlock({ block, onEditorReady }) {
  if (!block) {
    return null;
  }

  if (block.type === "section") {
    return (
      <div data-paper-block={block.id} className="flow-root min-w-0">
        <PaperSection block={block} />
      </div>
    );
  }

  if (block.type === "question") {
    return (
      <div data-paper-block={block.id} className="flow-root min-w-0">
        <PaperQuestion
          question={block.question}
          number={block.number}
          showAnswerKey={block.showAnswerKey}
          onEditorReady={onEditorReady}
        />
      </div>
    );
  }

  return null;
}
