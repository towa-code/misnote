import MistakesContent from "@/components/mistakes/mistakes-content";

export default async function MistakesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 科目・単元管理の「この科目の問題を見る」や編集画面から戻ったときに付く
  const subject = (await searchParams).subject;
  const subjectFilter = typeof subject === "string" ? subject : undefined;

  return <MistakesContent initialSubjectFilter={subjectFilter} />;
}
