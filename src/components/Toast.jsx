export default function Toast({ toast }) {
  if (!toast) return null;
  const bg = toast.type === 'error' ? '#DC2626'
    : toast.type === 'info' ? '#1F3864'
    : '#15803D';
  return (
    <div className="toast" style={{ background: bg }}>{toast.msg}</div>
  );
}
