import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { LabeledImage, type LabeledImageData, type Label } from "./LabeledImage";
import { LightboxImage } from "../Lightbox";

type Sidecar = {
  src: string;
  alt?: string;
  viewBox?: [number, number, number, number];
  license?: { type: string; attribution: string; url?: string };
  labels?: Label[];
};

type Props = {
  name: string;
  caption?: string;
  quizable?: boolean;
  maxHeight?: number;
};

export function Figure({ name, caption, quizable, maxHeight }: Props) {
  const jsonPath = path.join(process.cwd(), "public", "figures", `${name}.json`);
  let data: Sidecar | null = null;
  try {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    data = JSON.parse(raw) as Sidecar;
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="my-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        Missing figure metadata: <code>{name}.json</code>
      </div>
    );
  }

  if (data.labels && data.labels.length > 0 && data.viewBox) {
    const labeled: LabeledImageData = {
      src: data.src,
      alt: data.alt,
      viewBox: data.viewBox,
      labels: data.labels,
      license: data.license,
    };
    return <LabeledImage data={labeled} caption={caption} quizable={quizable} />;
  }

  return (
    <figure className="my-8">
      <div
        className="relative rounded-lg border border-zinc-200 bg-white p-3 flex items-center justify-center"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <LightboxImage
          src={data.src}
          alt={data.alt ?? caption ?? ""}
          className="max-h-[640px] w-auto max-w-full object-contain"
        />
      </div>
      {(caption || data.license) && (
        <figcaption className="mt-3 text-sm text-zinc-600">
          {caption && <div>{caption}</div>}
          {data.license && (
            <div className="mt-1 text-xs text-zinc-500">
              <span className="font-medium text-zinc-600">{data.license.type}</span> ·{" "}
              {data.license.url ? (
                <Link href={data.license.url} className="underline hover:text-rose-600" target="_blank">
                  {data.license.attribution}
                </Link>
              ) : (
                data.license.attribution
              )}
            </div>
          )}
        </figcaption>
      )}
    </figure>
  );
}
