"use client";

/*
we need this file to be able to use the heroui components in server components.
This is because the heroui components are written without using "use client", but they using client-side functions like useState, useEffect, etc.
so each time we would try to use them in a server component, we would get an error.
 */

export * from "@heroui/react";
