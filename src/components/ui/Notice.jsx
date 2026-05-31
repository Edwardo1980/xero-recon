export default function Notice({ type = 'info', id, children }) {
  const icons = { info: 'ℹ️', warn: '⚠', success: '✅', error: '⚠' };
  return (
    <div id={id} className={`notice ${type}`} role={type === 'warn' || type === 'error' ? 'alert' : 'note'}>
      <span aria-hidden="true">{icons[type]}</span>
      <div>{children}</div>
    </div>
  );
}
