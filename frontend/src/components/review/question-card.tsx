import type { MistakeNoteResponse } from "@/generated";

const cardLabel =
  "text-[11px] font-bold text-muted tracking-[0.08em] uppercase mb-3.5";

type Props = {
  note: MistakeNoteResponse;
  revealed: boolean;
};

export default function QuestionCard({ note, revealed }: Props) {
  // The API leaves correct_answer null when the question was registered without one,
  // even though the generated type declares it as a plain string.
  const correctAnswer: string | null = note.question.correctAnswer;

  return (
    <>
      <div className="bg-surface border border-border rounded-lg px-6 sm:px-8 py-6 sm:py-7 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className={cardLabel}>問題</div>
        <div className="font-serif text-[18px] sm:text-[20px] font-medium leading-[1.75] text-text whitespace-pre-wrap">
          {note.question.questionText}
        </div>
      </div>

      {revealed && (
        <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="px-6 py-5 border-b border-border last:border-b-0">
            <div className={cardLabel}>正解</div>
            {correctAnswer ? (
              <div className="font-serif text-[17px] sm:text-[18px] font-bold text-navy leading-relaxed whitespace-pre-wrap">
                {correctAnswer}
              </div>
            ) : (
              <div className="text-[13px] text-[#CBD5E1]">
                正解は登録されていません
              </div>
            )}
          </div>

          {note.memo && (
            <div className="px-6 py-5 border-b border-border last:border-b-0">
              <div className={cardLabel}>間違えた理由</div>
              <div className="text-[14px] text-text leading-[1.75] whitespace-pre-wrap">
                {note.memo}
              </div>
            </div>
          )}

          {note.learning && (
            <div className="px-6 py-5 border-b border-border last:border-b-0">
              <div className={cardLabel}>今回学んだこと</div>
              <div className="text-[14px] text-text leading-[1.75] whitespace-pre-wrap">
                {note.learning}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
