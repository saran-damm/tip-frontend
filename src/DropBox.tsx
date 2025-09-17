import React, { type JSX, useEffect, useRef, useState } from "react";

/* types */
type FileItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url: string;
  isImage: boolean;
};

/* helper to format bytes -> human readable */
function humanFileSize(size: number) {
  if (size === 0) return "0 B";
  if (!size && size !== 0) return "";
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return (size / Math.pow(1024, i)).toFixed(i ? 2 : 0) + " " + sizes[i];
}

export default function DropBox(): JSX.Element {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = [];
    };
  }, []);

  function genId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function addFiles(list: FileList | null) {
    const arr = Array.from(list || []);
    if (!arr.length) return;
    setFiles((prev) => {
      const next = [...prev];
      for (const file of arr) {
        const exists = next.some(
          (f) =>
            f.name === file.name &&
            f.size === file.size &&
            f.file.lastModified === file.lastModified
        );
        if (exists) continue;
        const url = URL.createObjectURL(file);
        urlsRef.current.push(url);
        // ensure boolean result (avoid string|boolean)
        const isImage = !!file.type && file.type.indexOf("image/") === 0;
        next.push({
          id: genId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          url,
          isImage,
        });
      }
      return next;
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
  }

  function openFile(item: FileItem) {
    window.open(item.url, "_blank", "noopener,noreferrer");
  }

  function downloadFile(item: FileItem) {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      // fallback for .find to avoid older lib issues
      const rem = prev.filter((p) => p.id === id)[0];
      if (rem) {
        try {
          URL.revokeObjectURL(rem.url);
          urlsRef.current = urlsRef.current.filter((u) => u !== rem.url);
        } catch {}
      }
      return prev.filter((p) => p.id !== id);
    });
  }

  function clearAll() {
    setFiles((prev) => {
      prev.forEach((p) => {
        try {
          URL.revokeObjectURL(p.url);
        } catch {}
      });
      urlsRef.current = [];
      return [];
    });
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-0">
      <div className="w-full max-w-full px-4 sm:px-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400">
            File uploader
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Drag & drop multiple files, or click to browse.
          </p>
        </header>

        {/* Card */}
        <div className="relative w-full bg-slate-800/40 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-700/50">
          {/* Drop area */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`mx-auto rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-default flex flex-col items-center justify-center select-none ${
              dragging
                ? "border-cyan-400 bg-slate-700/60 shadow-[0_10px_30px_rgba(56,189,248,0.08)] scale-[1.01]"
                : "border-slate-600 bg-slate-800/40"
            }`}
            style={{ width: "100%", height: "min(500px, 70vh)" }}
          >
            {/* hidden input */}
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={onInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <svg
                  className="h-7 w-7"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M7 9l5-5 5 5M12 4v12"
                  />
                </svg>
              </div>

              <div className="text-lg md:text-xl font-medium text-slate-100">
                Drop files here
              </div>
              <div className="text-sm text-slate-400">or click to browse</div>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform overflow-hidden"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                  />
                </svg>
                Choose files
              </button>
            </div>
          </div>

          {/* Uploaded files list */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Uploaded files{" "}
                <span className="text-sm text-slate-400">({files.length})</span>
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearAll}
                  disabled={files.length === 0}
                  className="text-xs px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear all
                </button>
              </div>
            </div>

            {files.length === 0 ? (
              <div className="text-sm text-slate-400">
                No files uploaded yet.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {files.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700"
                  >
                    <div className="flex-shrink-0">
                      {it.isImage ? (
                        <img
                          src={it.url}
                          alt={it.name}
                          className="h-16 w-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-md bg-slate-700 flex items-center justify-center text-slate-200 font-semibold">
                          {it.name.split(".").pop()?.slice(0, 4).toUpperCase() ||
                            "FILE"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate">
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs text-slate-400">
                            {humanFileSize(it.size)} • {it.type || "unknown"}
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => openFile(it)}
                            className="px-3 py-1 text-xs rounded bg-cyan-600 hover:bg-cyan-700 text-white overflow-hidden"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => downloadFile(it)}
                            className="px-3 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-700 text-white overflow-hidden"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => removeFile(it.id)}
                            className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white overflow-hidden"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
