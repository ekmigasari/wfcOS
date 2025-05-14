"use client";

import { useAtom, useAtomValue } from "jotai";
import { ChevronLeft , ChevronRight } from "lucide-react";
import React from "react";

import {
  deleteSessionAtom,
  sortedSessionsAtom,
} from "@/application/atoms/sessionAtoms";
import { tasksAtom } from "@/application/atoms/todoListAtom";
import { playSound } from "@/infrastructure/lib/utils";
import { Button } from "@/presentation/components/ui/button";

import { SessionLogTable } from "./SessionLogTable"; // Assuming SessionLogTable.tsx is in the same directory

const ITEMS_PER_PAGE = 10;

export const TableSection = () => {
  const sessions = useAtomValue(sortedSessionsAtom);
  const allTasks = useAtomValue(tasksAtom);
  const [, deleteSession] = useAtom(deleteSessionAtom);
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleInteractionSound = () => {
    playSound("/sounds/click.mp3", "ui-interaction");
  };

  const totalPages = Math.ceil(sessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sessions, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    handleInteractionSound();
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    handleInteractionSound();
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
            variant="ghost"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="hover:bg-secondary/20 disabled:opacity-0"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="hover:bg-secondary/20 disabled:opacity-0"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </>
  );
};
