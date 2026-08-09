import RegisterForm from "@/components/register/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // クイック保存の下書きから来た場合、その本文を問題文に流し込む
  const draft = (await searchParams).draft;
  const draftId = typeof draft === "string" ? draft : undefined;

  return <RegisterForm draftId={draftId} />;
}
