import QuestionEditForm from "@/components/question-edit/question-edit-form";

// params and searchParams are Promises in this Next.js version
export default async function QuestionEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  // 苦手問題一覧を科目で絞り込んでいたら、保存後もその絞り込みに戻す
  const subject = (await searchParams).subject;
  const subjectFilter = typeof subject === "string" ? subject : undefined;

  return <QuestionEditForm questionId={id} subjectFilter={subjectFilter} />;
}
