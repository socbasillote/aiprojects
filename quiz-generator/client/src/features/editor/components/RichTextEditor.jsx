import QuestionContentEditor from "./QuestionContentEditor";

export default function RichTextEditor({ content, onChange }) {
  return <QuestionContentEditor content={content} onChange={onChange} />;
}
