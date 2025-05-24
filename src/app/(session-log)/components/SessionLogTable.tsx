"use client";

import { Trash2 } from "lucide-react";
import React from "react";

import { TaskItem } from "@/application/atoms/todoListAtom";
import { TimerSession } from "@/application/types/timer.types";
import { playSound } from "@/infrastructure/lib/utils";
import { Button } from "@/presentation/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";

import { formatTime, getTaskName } from "../sessionLogUtils";

interface SessionLogTableProps {
  sessions: TimerSession[];
  allTasks: TaskItem[];
  deleteSession: (id: string) => void;
}

export const SessionLogTable: React.FC<SessionLogTableProps> = ({
  sessions,
  allTasks,
  deleteSession,
}) => {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 flex-grow">
        <p className="text-xl text-muted-foreground mb-2">
          No sessions recorded yet.
        </p>
        <p className="text-sm text-muted-foreground">
          Complete a work timer to see your sessions here.
        </p>
      </div>
    );
  }

  const handleInteractionSound = () => {
    playSound("/sounds/click.mp3", "ui-interaction");
  };

  return (
    <div className="flex-grow border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">Date</TableHead>
            <TableHead>Task</TableHead>
            <TableHead className="w-[90px]">Start</TableHead>
            <TableHead className="w-[90px]">End</TableHead>
            <TableHead className="w-[70px] text-right">Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session: TimerSession) => (
            <TableRow key={session.id} className="text-xs">
              <TableCell className="py-1.5 px-2">{session.date}</TableCell>
              <TableCell className="py-1.5 px-2">
                {getTaskName(session.taskId, allTasks)}
              </TableCell>
              <TableCell className="py-1.5 px-2">
                {formatTime(session.startTime)}
              </TableCell>
              <TableCell className="py-1.5 px-2">
                {formatTime(session.endTime)}
              </TableCell>

              <TableCell className="text-right py-1.5 px-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    deleteSession(session.id);
                    handleInteractionSound();
                  }}
                  aria-label="Delete session"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
