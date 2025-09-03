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

export default function NotFoundClient() {
  return (
    <div className="flex w-full pt-40 items-center justify-center p-6">
      <Card className="max-w-lg w-full shadow-lg">
        <CardHeader className="flex flex-col items-center gap-3">
          <h1 className="text-5xl font-bold text-danger">404</h1>
          <p className="text-xl font-medium">Page Not Found</p>
        </CardHeader>
        <Divider />
        <CardBody className="text-center gap-2">
          <p className="text-default-600">
            Oops! The page you are looking for doesn't exist.
          </p>
          <p className="text-default-500">
            You can check{" "}
            <Link
              href="https://status.coregame.de"
              underline="hover"
              color="primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              status.coregame.de
            </Link>{" "}
            for any known issues.
          </p>
        </CardBody>
        <CardFooter className="flex justify-center">
          <Button
            color="danger"
            onPress={() => {
              const base =
                "https://github.com/42core-team/website_relaunch/issues/new";
              const title = encodeURIComponent(
                `Bug: 404 on ${location.pathname}`,
              );
              const body = encodeURIComponent(
                `Please help us fix this 404 by filling out the details below.\n\n` +
                  `- Broken URL: ${location.href}\n` +
                  `- Referrer: ${document.referrer || "N/A"}\n` +
                  `- Expected behavior:\n` +
                  `- Actual behavior (error message or what you saw):\n` +
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
            Open an issue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
