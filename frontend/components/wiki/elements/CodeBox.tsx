import { FC, useState } from 'react';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Button } from "@heroui/react";

interface CodeBoxProps {
  code: string;
  language: string;
}

export const CodeBox: FC<CodeBoxProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <Button
        size="sm"
        className="absolute right-2 top-2"
        onClick={copyToClipboard}
      >
        {copied ? 'Copied!' : 'Copy'}
      </Button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        className="rounded-lg !bg-default-100"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};