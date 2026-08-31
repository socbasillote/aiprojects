import { useDispatch, useSelector } from "react-redux";

import { updateTitle } from "../editorSlice";

export default function AssessmentTitle() {
  const dispatch = useDispatch();

  const title = useSelector((state) => state.editor.title);

  return (
    <input
      type="text"
      value={title}
      onChange={(event) => {
        dispatch(updateTitle(event.target.value));
      }}
      placeholder="Untitled Assessment"
      aria-label="Assessment title"
      className="w-full max-w-xl bg-transparent text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-400"
    />
  );
}
