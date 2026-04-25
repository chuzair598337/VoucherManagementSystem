export default function DeleteConfirmModal({ open, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="ov" onClick={onCancel}>
      <div className="conf" onClick={ev => ev.stopPropagation()}>
        <h3>Delete Voucher Entry</h3>
        <p>This voucher will be permanently deleted and cannot be recovered.</p>
        <div className="cbts">
          <button className="btnc" onClick={onCancel}>Cancel</button>
          <button className="btnd" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}
