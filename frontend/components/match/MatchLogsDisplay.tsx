"use client";

import { useState, useEffect } from "react";
import { MatchLogs } from "@/app/actions/tournament-model";
import { Input } from "@heroui/input";
import { Tab, Tabs } from "@heroui/tabs";

interface MatchLogsDisplayProps {
  logs: MatchLogs;
}

export default function MatchLogsDisplay({ logs }: MatchLogsDisplayProps) {
  const [selectedTab, setSelectedTab] = useState<string>(
    logs.length > 0 ? logs[0].container : "",
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter logs based on search query
  const getFilteredLogs = (logArray: string[]) => {
    if (!searchQuery.trim()) return logArray;

    return logArray.filter((log) =>
      log.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Match Logs</h2>
        <div className="w-1/3">
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <Tabs>
        {logs.map((log) => (
          <Tab
            key={log.container}
            value={log.container}
            title={log.team || log.container}
            onClick={() => setSelectedTab(log.container)}
          >
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              {selectedTab === log.container && (
                <pre className="whitespace-pre-wrap p-4 rounded-md">
                  {getFilteredLogs(log.logs).map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </pre>
              )}
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
