"use client";

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  children
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  const handleClick = () => {
    if (window.confirm(`${title}\n\n${description}`)) {
      onConfirm();
    }
  };

  return (
    <button type="button" onClick={handleClick} className="focus-ring rounded-md border px-3 py-2 text-sm hover:bg-muted">
      {children}
    </button>
  );
}
