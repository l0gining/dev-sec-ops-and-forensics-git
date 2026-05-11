export function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-border bg-white text-sm text-slate-500">
      {label}
    </div>
  );
}
