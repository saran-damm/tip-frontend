import React, { type JSX, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./components/Navbar";
import { BACKEND_HTTP } from "./config";
import { tenants } from "./tenants";

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const urlsRef = useRef<string[]>([]);
  const { slug } = useParams<{ slug: string }>();
  const tenant = tenants.find(t => t.slug === slug);
  const tenantId = tenant ? tenant.id : '';

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

  async function uploadFiles() {
    if (files.length === 0) {
      setUploadError("No files to upload");
      return;
    }

    // Check if all files are PDFs
    const nonPdfFiles = files.filter(file => file.type !== "application/pdf");
    if (nonPdfFiles.length > 0) {
      setUploadError(`Only PDF files are allowed. Please remove: ${nonPdfFiles.map(f => f.name).join(", ")}`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Upload each PDF file
      for (const fileItem of files) {
        const formData = new FormData();
        formData.append("file", fileItem.file);
        formData.append("tenant_id", tenantId);

        const response = await fetch(`${BACKEND_HTTP}/api/v1/upload_pdf/`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${fileItem.name}: ${response.statusText}`);
        }
      }

      // Clear files after successful upload
      clearAll();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to upload files");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Navbar>
      <div className="h-full w-full flex flex-col bg-blue-50 text-gray-900 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 md:px-8 bg-gradient-to-r from-[#476EAE]/10 to-white border-b border-[#48B3AF]/20">
          <div className="flex items-center">
            <div className="mr-3 bg-gradient-to-br from-[#476EAE] to-[#48B3AF] rounded-full p-2 shadow-md">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M12 3v10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 7l4-4 4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 21H3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
            <h3 className="font-bold text-2xl text-[#476EAE]">Train your bot</h3>
            <p className="text-sm text-[#48B3AF]">Upload documents to enhance your bot's knowledge</p>
          </div>
        </div>
        <div className="text-sm font-medium text-[#476EAE] bg-[#476EAE]/10 px-3 py-2 rounded-lg shadow-sm border border-[#48B3AF]/20">
          Drag & drop or choose files
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow border border-[#48B3AF]/20 p-6">
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
              dragging ? "border-[#48B3AF] bg-[#476EAE]/10" : "border-gray-300 bg-gray-50"
            }`}
            style={{ width: "100%", height: "min(400px, 60vh)" }}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="application/pdf,.pdf"
              onChange={onInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#476EAE] to-[#48B3AF] flex items-center justify-center text-white shadow">
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
                className="mt-2 px-4 py-1.5 text-sm font-medium rounded bg-gradient-to-r from-[#476EAE] to-[#48B3AF] text-gray-800 hover:opacity-90 transition shadow-sm border border-[#476EAE]/30"
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
              <div className="flex items-center gap-2">
                <button
                  onClick={uploadFiles}
                  disabled={files.length === 0 || uploading}
                  className="text-xs px-3 py-1 rounded bg-gradient-to-r from-[#476EAE] to-[#48B3AF] text-gray-800 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-[#476EAE]/30"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  onClick={clearAll}
                  disabled={files.length === 0 || uploading}
                  className="text-xs px-3 py-1 rounded bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-300"
                >
                  Clear all
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="text-sm text-red-500 mb-3">{uploadError}</div>
            )}
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
                            className="px-3 py-1 text-xs rounded bg-gradient-to-r from-[#476EAE] to-[#48B3AF] text-gray-800 font-medium hover:opacity-90 shadow-sm border border-[#476EAE]/30"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => downloadFile(it)}
                            className="px-3 py-1 text-xs rounded bg-gradient-to-r from-[#476EAE] to-[#48B3AF] text-gray-800 font-medium hover:opacity-90 shadow-sm border border-[#476EAE]/30"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => removeFile(it.id)}
                            className="px-3 py-1 text-xs rounded bg-gradient-to-r from-[#476EAE] to-[#48B3AF] text-gray-800 font-medium hover:opacity-90 shadow-sm border border-[#476EAE]/30"
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
    </Navbar>
  );
}
