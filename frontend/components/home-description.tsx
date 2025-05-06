import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";

interface HomeDescriptionProps {
  title: string;
  subtitle: string;
  description: string;
  code?: string;
}

export default function HomeDescription({
  title,
  subtitle,
  description,
  code = "app/page.tsx",
}: HomeDescriptionProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="text-2xl">{subtitle}</p>
      <p className="text-xl text-gray-400">{description}</p>
      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>
            Get started by editing <Code color="primary">{code}</Code>
          </span>
        </Snippet>
      </div>
    </div>
  );
}
