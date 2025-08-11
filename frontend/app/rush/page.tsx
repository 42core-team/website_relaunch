"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { title } from "@/components/primitives";
import { DownloadIcon } from "@/components/icons";

export default function RushPage() {
  const [mounted, setMounted] = useState(false);
  const pdfUrl =
    "https://core-files.object.storage.eu01.onstackit.cloud/subjects/rush/rush-02.pdf";

  // Wait for component to mount to avoid hydration issues with iframe
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="container mx-auto py-4 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex flex-row items-center justify-center gap-4">
          <h1 className={title()}>Rush Subject</h1>
          <motion.a
            href={pdfUrl}
            download="rush-02.pdf"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
            aria-label="Download PDF"
          >
            <DownloadIcon className="w-5 h-5" />
          </motion.a>
        </div>
      </motion.div>

      {mounted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full bg-black rounded-lg overflow-hidden shadow-xl"
          style={{ height: "75vh" }}
        >
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="CORE Rush Guide"
          />
        </motion.div>
      )}
    </div>
  );
}
