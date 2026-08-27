export default function RichTextRenderer({ content }) {
  if (!content) {
    return null;
  }

  return (
    <div className="paper-rich-text">{renderNodes(content.content || [])}</div>
  );
}

function renderNodes(nodes, keyPrefix = "node") {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    return renderNode(node, key);
  });
}

function renderNode(node, key) {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className="mb-2 leading-6">
          {renderInlineContent(node.content)}
        </p>
      );

    case "heading": {
      const level = node.attrs?.level || 2;

      const className = {
        1: "mb-3 text-xl font-bold",
        2: "mb-3 text-lg font-bold",
        3: "mb-2 text-base font-bold",
      }[level];

      const Tag = `h${level}`;

      return (
        <Tag key={key} className={className}>
          {renderInlineContent(node.content)}
        </Tag>
      );
    }

    case "bulletList":
      return (
        <ul key={key} className="mb-3 list-disc space-y-1 pl-6">
          {renderNodes(node.content, key)}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="mb-3 list-decimal space-y-1 pl-6">
          {renderNodes(node.content, key)}
        </ol>
      );

    case "listItem":
      return <li key={key}>{renderNodes(node.content, key)}</li>;

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="my-3 border-l-2 border-slate-400 pl-4 italic"
        >
          {renderNodes(node.content, key)}
        </blockquote>
      );

    case "hardBreak":
      return <br key={key} />;

    case "horizontalRule":
      return <hr key={key} className="my-4 border-slate-300" />;

    default:
      return null;
  }
}

function renderInlineContent(content = []) {
  return content.map((node, index) => {
    if (node.type === "hardBreak") {
      return <br key={index} />;
    }

    if (node.type !== "text") {
      return null;
    }

    let element = node.text;

    const marks = node.marks || [];

    for (const mark of marks) {
      switch (mark.type) {
        case "bold":
          element = <strong key={`${index}-bold`}>{element}</strong>;
          break;

        case "italic":
          element = <em key={`${index}-italic`}>{element}</em>;
          break;

        case "underline":
          element = <u key={`${index}-underline`}>{element}</u>;
          break;

        case "strike":
          element = <s key={`${index}-strike`}>{element}</s>;
          break;

        case "code":
          element = (
            <code key={`${index}-code`} className="rounded bg-slate-100 px-1">
              {element}
            </code>
          );
          break;

        default:
          break;
      }
    }

    return <span key={index}>{element}</span>;
  });
}
