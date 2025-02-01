"use client";

import React from "react";
import {Card, CardBody, CardHeader, Button} from "@heroui/react";
import {Icon} from "@iconify/react";

const WikiPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center p-8">
      <Card className="max-w-2xl w-full">
        <CardHeader className="flex gap-3 justify-center">
          <div className="flex flex-col items-center gap-3">
            <Icon icon="solar:notebook-bold" className="text-6xl text-default-500" />
            <h1 className="text-2xl font-bold">Wiki Coming Soon</h1>
          </div>
        </CardHeader>
        <CardBody className="text-center">
          <p className="text-default-500 mb-6">
            We're working hard to build a comprehensive knowledge base. Stay tuned for updates!
          </p>
          <Button
            color="primary"
            as="a"
            href="/"
            startContent={<Icon icon="solar:home-2-bold" />}
          >
            Return Home
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default WikiPage;
