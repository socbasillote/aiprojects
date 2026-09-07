import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import { addQuestion, assignQuestionToSection } from "../features/editor/editorSlice";
import {
  bankQuestionToEditorQuestion,
  questionBankQuestions,
  questionTypeLabels,
} from "../features/question-banks/questionBankData";

const filterFields = [
  ["subject", "Subject"], ["topic", "Topic"], ["grade", "Grade"],
  ["difficulty", "Difficulty"], ["type", "Question Type"],
  ["createdBy", "Created by"], ["source", "Source"],
];

function uniqueValues(field) {
  return [...new Set(questionBankQuestions.map((question) => question[field]))];
}

export default function QuestionBankPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [bankQuestions, setBankQuestions] = useState(questionBankQuestions);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("recent");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bankQuestions
      .filter((question) => {
        const matchesSearch = !query || [question.title, question.text, question.topic]
          .join(" ").toLowerCase().includes(query);
        return matchesSearch && filterFields.every(([field]) => !filters[field] || question[field] === filters[field]);
      })
      .sort((first, second) => sort === "title" ? first.title.localeCompare(second.title) : 0);
  }, [bankQuestions, filters, search, sort]);

  function addFromBank(question) {
    const editorQuestion = bankQuestionToEditorQuestion(question);
    dispatch(addQuestion(editorQuestion));
    dispatch(assignQuestionToSection({ questionId: editorQuestion.id, sectionId: "section-1" }));
    setNotice(`“${question.title}” was added to the paper.`);
    navigate("/assessments/current/paper");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-3xl font-bold text-slate-900">Question Bank</h1><p className="mt-1 text-sm text-slate-500">Reusable questions for your assessments</p></div>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">+ Add Question</button>
        </header>
        {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions..." className="min-w-64 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500" />
            {filterFields.map(([field, label]) => <select key={field} value={filters[field] || ""} onChange={(event) => setFilters({ ...filters, [field]: event.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"><option value="">{label}</option>{uniqueValues(field).map((value) => <option key={value} value={value}>{field === "type" ? questionTypeLabels[value] : value}</option>)}</select>)}
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"><option value="recent">Sort: Recent</option><option value="title">Sort: Title</option></select>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((question) => <article key={question.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><h2 className="font-semibold text-slate-900">{question.title}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{questionTypeLabels[question.type]}</span></div><p className="mt-5 text-sm leading-6 text-slate-700">{question.text}</p><p className="mt-5 text-xs text-slate-500">{question.subject} · {question.grade} · {question.difficulty} · {question.points} points</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setNotice("Question editing is available from the paper after adding it.")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</button><button type="button" onClick={() => addFromBank(question)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">Add to Assessment</button></div></article>)}
            {filteredQuestions.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">No questions match these filters.</p>}
          </div>
        </section>
      </div>
      {isCreateOpen && <CreateQuestionDialog onClose={() => setIsCreateOpen(false)} onCreated={(question) => { setBankQuestions((current) => [question, ...current]); setIsCreateOpen(false); setNotice("Question saved to your question bank."); }} />}
    </AppShell>
  );
}

function CreateQuestionDialog({ onClose, onCreated }) {
  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onCreated({
      id: `bank-question-${Date.now()}`,
      title: formData.get("title"),
      text: formData.get("text"),
      type: "multiple_choice",
      subject: "Uncategorized",
      topic: "General",
      grade: "All grades",
      difficulty: "Medium",
      points: 1,
      tags: [],
      createdBy: "You",
      source: "My questions",
      options: ["Option A", "Option B"],
      answer: "Option A",
    });
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="create-question-title"><form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><h2 id="create-question-title" className="text-lg font-semibold text-slate-900">Add a bank question</h2><button type="button" onClick={onClose} className="text-xl text-slate-400" aria-label="Close">×</button></div><input name="title" required placeholder="Question title" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><textarea name="text" required placeholder="Question text" rows="4" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Cancel</button><button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">Save question</button></div></form></div>;
}
