import * as runtime from "react/jsx-runtime";
import type { ComponentType, ReactNode } from "react";
import { Figure } from "@/components/mdx/Figure";
import { Quiz } from "@/components/mdx/Quiz";
import { Clinical } from "@/components/mdx/Clinical";
import { Mnemonic } from "@/components/mdx/Mnemonic";
import { Note } from "@/components/mdx/Note";
import { DiagramQuizFromName } from "@/components/mdx/DiagramQuizFromName";
import { HighYield } from "@/components/mdx/HighYield";
import { ClinicalCase } from "@/components/mdx/ClinicalCase";

const sharedComponents: Record<string, ComponentType<unknown>> = {
  Figure: Figure as ComponentType<unknown>,
  Quiz: Quiz as ComponentType<unknown>,
  DiagramQuiz: DiagramQuizFromName as ComponentType<unknown>,
  Clinical: Clinical as ComponentType<unknown>,
  ClinicalCase: ClinicalCase as ComponentType<unknown>,
  Mnemonic: Mnemonic as ComponentType<unknown>,
  Note: Note as ComponentType<unknown>,
  HighYield: HighYield as ComponentType<unknown>,
};

type MDXModule = { default: ComponentType<{ components?: Record<string, unknown> }> };

export function MDXContent({
  code,
  components,
}: {
  code: string;
  components?: Record<string, ComponentType<unknown>>;
}): ReactNode {
  const fn = new Function(code);
  const mod = fn({ ...runtime }) as MDXModule;
  const Component = mod.default;
  return <Component components={{ ...sharedComponents, ...(components ?? {}) }} />;
}
