import ReviewFlow from "@/components/review/review-flow";

// params is a Promise in this Next.js version
export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReviewFlow noteId={id} />;
}
