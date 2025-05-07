"use client";

import React from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  deleteSessionAtom,
  sortedSessionsAtom,
} from "@/application/atoms/sessionAtoms";
import { tasksAtom } from "@/application/atoms/todoListAtom";
import { SessionLogTable } from "./SessionLogTable"; // Assuming SessionLogTable.tsx is in the same directory
import { Button } from "@/presentation/components/ui/button";

const ITEMS_PER_PAGE = 10;

export const TableSection = () => {
  const sessions = useAtomValue(sortedSessionsAtom);
  const allTasks = useAtomValue(tasksAtom);
  const [, deleteSession] = useAtom(deleteSessionAtom);
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(sessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sessions, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <>
      <SessionLogTable
        sessions={paginatedSessions}
        allTasks={allTasks}
        deleteSession={deleteSession}
      />
      {sessions.length > ITEMS_PER_PAGE && (
        <div className="mt-4 flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
};
