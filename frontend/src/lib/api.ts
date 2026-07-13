import {
  Configuration,
  SubjectsApi,
  UnitsApi,
  QuestionsApi,
  MistakeNotesApi,
} from "@/generated";

const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
});

export const subjectsApi = new SubjectsApi(config);
export const unitsApi = new UnitsApi(config);
export const questionsApi = new QuestionsApi(config);
export const mistakeNotesApi = new MistakeNotesApi(config);
