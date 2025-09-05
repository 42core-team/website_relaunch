"use client";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Button,
  Link,
} from "@heroui/react";

export default function Error({ error }: { error: Error }) {
  return (
    <div className="flex w-full pt-40 items-center justify-center p-6">
      <Card className="max-w-lg w-full shadow-lg">
        <CardHeader className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold text-danger">
            Something went wrong
          </h1>
          <p className="text-default-600">An unexpected error occurred.</p>
        </CardHeader>
        <Divider />
        <CardBody className="text-center space-y-4">
          <p className="text-default-700">
            <strong>Error message:</strong> {error.message}
          </p>
          <p className="text-default-500">
            If the problem persists, you can check{" "}
            <Link
              href="https://status.coregame.de"
              underline="hover"
              color="primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              status.coregame.de
            </Link>{" "}
            for known issues.
          </p>
        </CardBody>
        <CardFooter className="flex justify-center">
          <Button
            color="danger"
            onPress={() => {
              const base =
                "https://github.com/42core-team/website_relaunch/issues/new";
              const title = encodeURIComponent(`Bug: Error - ${error.message}`);
              const body = encodeURIComponent(
                `An unexpected error occurred.\n\n` +
                  `- Error message: ${error.message}\n` +
                  `- Broken URL: ${location.href}\n` +
                  `- Referrer: ${document.referrer || "N/A"}\n` +
                  `- Expected behavior:\n` +
                  `- Actual behavior:\n` +
                  `- Screenshot(s): Drag-and-drop or paste here\n` +
                  `- Browser: ${navigator.userAgent}\n` +
                  `- OS: \n` +
                  `- Device: \n` +
                  `- Time (UTC): ${new Date()
                    .toISOString()
                    .replace("T", " ")
                    .replace("Z", " UTC")}\n\n` +
                  `Additional context:\n`,
              );
              window.open(
                `${base}?labels=bug&title=${title}&body=${body}`,
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            Report this error
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
