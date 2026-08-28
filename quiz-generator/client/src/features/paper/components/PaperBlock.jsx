import PaperQuestion from "./PaperQuestion";

export default function PaperBlock({ block }) {
  if (block.type === "section") {
    return (
      <section className="mb-5 break-inside-avoid">
        {block.title && (
          <h2 className="text-sm font-bold uppercase">{block.title}</h2>
        )}

        {block.instructions && (
          <p className="mt-1 whitespace-pre-wrap text-xs leading-5">
            {block.instructions}
          </p>
        )}
      </section>
    );
  }

  if (block.type === "question") {
    return <PaperQuestion question={block.question} number={block.number} />;
  }

  return null;
}
