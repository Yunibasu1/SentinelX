export default function RecordActions({
  onView,
  onDelete,
}: {
  onView: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={onView}
        className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
      >
        Detalle
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
      >
        Eliminar
      </button>
    </div>
  )
}
