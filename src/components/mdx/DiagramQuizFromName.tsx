import fs from "node:fs";
import path from "node:path";
import { DiagramQuiz, type DiagramQuizData } from "./DiagramQuiz";

type Props = {
  name: string;
  title?: string;
};

export function DiagramQuizFromName({ name, title }: Props) {
  const jsonPath = path.join(process.cwd(), "public", "figures", `${name}.json`);
  let data: DiagramQuizData | null = null;
  try {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DiagramQuizData>;
    if (parsed.viewBox && parsed.labels && parsed.src) {
      data = parsed as DiagramQuizData;
    }
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="my-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        Diagram quiz needs a JSON with <code>viewBox</code> + <code>labels</code>:{" "}
        <code>{name}.json</code>
      </div>
    );
  }

  return <DiagramQuiz data={data} title={title} />;
}
