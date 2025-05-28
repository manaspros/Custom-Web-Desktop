"use client";

import { useState, useEffect, useRef } from "react";
import { useOS } from "@/components/contexts/OSContext";

interface TerminalProps {
  windowId?: string;
}

interface CommandHistory {
  command: string;
  output: string;
}

export default function Terminal({ windowId: _windowId = "default" }: TerminalProps) {
  const { addNotification } = useOS();
  const [input, setInput] = useState<string>("");
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([]);
  const [directoryPath, setDirectoryPath] = useState<string>("C:\\Users\\User");
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const availableCommands = {
    help: "Display available commands",
    cls: "Clear the terminal screen",
    echo: "Display a message",
    date: "Display the current date and time",
    dir: "List directory contents",
    cd: "Change directory",
    ver: "Display system version information",
    whoami: "Display current user",
    exit: "Exit terminal (minimizes window)",
  };

  // Focus input when terminal is clicked
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Scroll to bottom when command history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  // Initial welcome message
  useEffect(() => {
    setCommandHistory([
      {
        command: "",
        output: `Microsoft Windows [Version 11.0.22621.1]
(c) Microsoft Corporation. All rights reserved.

Type 'help' to see available commands.`,
      },
    ]);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand();
    }
  };

  const executeCommand = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const [cmd, ...args] = trimmedInput.split(" ");
    const argString = args.join(" ");

    let output = "";

    // Process command
    switch (cmd.toLowerCase()) {
      case "help":
        output = Object.entries(availableCommands)
          .map(([cmd, desc]) => `${cmd.padEnd(10)} - ${desc}`)
          .join("\\n");
        break;

      case "cls":
        // Clear command history
        setCommandHistory([]);
        setInput("");
        return;

      case "echo":
        output = argString || "";
        break;

      case "date":
        output = new Date().toString();
        break;

      case "dir":
        output = `
 Directory of ${directoryPath}

10/20/2023  09:15 AM    <DIR>          Documents
10/20/2023  09:15 AM    <DIR>          Downloads
10/20/2023  09:15 AM    <DIR>          Pictures
10/20/2023  09:15 AM    <DIR>          Music
10/20/2023  09:15 AM    <DIR>          Videos
10/20/2023  02:30 PM             8,192 notes.txt
10/20/2023  03:45 PM            24,576 report.docx
`;
        break;

      case "cd":
        if (argString) {
          if (argString === "..") {
            // Move up one directory
            const newPath = directoryPath.split("\\").slice(0, -1).join("\\");
            setDirectoryPath(newPath || "C:\\");
            output = "";
          } else {
            // Change to specified directory (simulated)
            setDirectoryPath(`${directoryPath}\\${argString}`);
            output = "";
          }
        } else {
          output = directoryPath;
        }
        break;

      case "ver":
        output = "Microsoft Windows [Version 11.0.22621.1]";
        break;

      case "whoami":
        output = "User";
        break;

      case "exit":
        // This would normally close the window, but in our simulation we can just show a notification
        addNotification({
          title: "Terminal",
          message: "Terminal session ended",
          icon: "terminal",
        });
        output = "Exiting terminal...";
        break;

      default:
        output = `'${cmd}' is not recognized as an internal or external command, operable program or batch file.`;
    }

    // Add command and output to history
    setCommandHistory((prev) => [
      ...prev,
      {
        command: `${directoryPath}>${trimmedInput}`,
        output: output,
      },
    ]);

    // Clear input
    setInput("");
  };

  return (
    <div className="terminal-container" onClick={focusInput} ref={terminalRef}>
      {commandHistory.map((item, index) => (
        <div key={index} className="command-block">
          {item.command && <div className="command-line">{item.command}</div>}
          <div className="command-output">
            {item.output.split("\\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      ))}

      <div className="input-line">
        <span className="prompt">{directoryPath}&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="terminal-input"
          spellCheck={false}
          autoFocus
        />
      </div>

      <style jsx>{`
        .terminal-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: #0c0c0c;
          color: #cccccc;
          font-family: "Consolas", "Courier New", monospace;
          font-size: 14px;
          padding: 10px;
          overflow-y: auto;
        }

        .command-block {
          margin-bottom: 10px;
        }

        .command-line {
          color: #cccccc;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .command-output {
          color: #cccccc;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .input-line {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .prompt {
          color: #cccccc;
          margin-right: 5px;
        }

        .terminal-input {
          flex: 1;
          background-color: transparent;
          border: none;
          color: #cccccc;
          font-family: "Consolas", "Courier New", monospace;
          font-size: 14px;
          caret-color: #cccccc;
        }

        .terminal-input:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
