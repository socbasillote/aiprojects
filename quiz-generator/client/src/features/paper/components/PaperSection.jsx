import { PAPER_STYLES } from "../paperStyles";

export default function PaperSection({ block }) {
  if (!block) {
    return null;
  }

  const hasTitle = Boolean(block.title?.trim());

  const hasInstructions = Boolean(block.instructions?.trim());

  if (!hasTitle && !hasInstructions) {
    return null;
  }

  return (
    <section
      className="break-inside-avoid"
      style={{
        marginBottom: PAPER_STYLES.section.marginBottom,
        fontFamily: PAPER_STYLES.fontFamily,
      }}
    >
      {hasTitle && (
        <h2
          style={{
            margin: 0,
            fontSize: PAPER_STYLES.section.titleSize,
            fontWeight: PAPER_STYLES.section.titleWeight,
          }}
        >
          {block.title}
        </h2>
      )}

      {hasInstructions && (
        <p
          className="whitespace-pre-wrap"
          style={{
            marginTop: "4px",
            marginBottom: 0,
            fontSize: PAPER_STYLES.section.instructionsSize,
            lineHeight: PAPER_STYLES.section.instructionsLineHeight,
          }}
        >
          {block.instructions}
        </p>
      )}
    </section>
  );
}
