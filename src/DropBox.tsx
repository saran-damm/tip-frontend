import React, { type JSX, useEffect, useRef, useState } from "react";

type FileItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url: string;
  isImage: boolean;
};

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
      urlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
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
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    setDragging(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="min-h-screen w-screen flex flex-col bg-gray-100 text-gray-900">
      {/* Header same size as chat */}
      <header className="bg-blue-600 text-white px-6 py-3 shadow-md flex items-center">
        <span className="text-lg font-semibold">File Uploader</span>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow border border-gray-200 p-6">
          {/* Drop area */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`mx-auto rounded-md border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer select-none ${
              dragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"
            }`}
            style={{ width: "100%", height: "min(400px, 60vh)" }}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={onInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow">
                <svg
                  className="h-6 w-6"
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

              <div className="text-base font-medium">Drop files here</div>
              <div className="text-sm text-gray-500">or click to browse</div>

              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  inputRef.current?.click();
                }}
                className="mt-2 px-4 py-1.5 text-sm font-medium rounded !bg-blue-600 !text-white hover:!bg-blue-700 transition"
              >
                Choose files
              </button>
            </div>
          </div>

          {/* Uploaded files list */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold">
                Uploaded files{" "}
                <span className="text-sm text-gray-500">({files.length})</span>
              </span>
              <button
                onClick={clearAll}
                disabled={files.length === 0}
                className="text-xs px-3 py-1 rounded !bg-blue-600 !text-white hover:!bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear all
              </button>
            </div>

            {files.length === 0 ? (
              <div className="text-sm text-gray-500">No files uploaded yet.</div>
            ) : (
              <ul className="flex flex-col gap-2">
                {files.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-center gap-3 bg-white p-3 rounded border border-gray-200"
                  >
                    <div className="flex-shrink-0">
                      {it.isImage ? (
                        <img
                          src={it.url}
                          alt={it.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center text-gray-700 text-sm font-semibold border border-gray-200">
                          {it.name.split(".").pop()?.slice(0, 4).toUpperCase() || "FILE"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate">
                          <div className="font-medium text-sm">{it.name}</div>
                          <div className="text-xs text-gray-500">
                            {humanFileSize(it.size)} • {it.type || "unknown"}
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => openFile(it)}
                            className="px-3 py-1 text-xs rounded !bg-blue-600 !text-white hover:!bg-blue-700"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => downloadFile(it)}
                            className="px-3 py-1 text-xs rounded !bg-blue-600 !text-white hover:!bg-blue-700"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => removeFile(it.id)}
                            className="px-3 py-1 text-xs rounded !bg-blue-600 !text-white hover:!bg-blue-700"
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
      </main>
    </div>
  );
}
