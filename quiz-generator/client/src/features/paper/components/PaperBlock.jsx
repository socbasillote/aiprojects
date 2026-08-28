import PaperQuestion from "./PaperQuestion";

export default function PaperBlock({ block }) {
  if (block.type === "section") {
    return (
      <section className="paper-section break-inside-avoid">
        <div className="mb-4">
          <h2 className="text-base font-bold uppercase tracking-wide">
            {block.title}
          </h2>

          {block.instructions && (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {block.instructions}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (block.type === "question") {
    return <PaperQuestion question={block.question} number={block.number} />;
  }

  return null;
}
