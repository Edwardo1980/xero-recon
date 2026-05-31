export default function Notice({ type = 'info', children }) {
  const icons = { info: 'ℹ️', warn: '⚠', success: '✅', error: '⚠' };
  return (
    <div className={`notice ${type}`} role={type === 'warn' || type === 'error' ? 'alert' : 'note'}>
      <span aria-hidden="true">{icons[type]}</span>
      <div>{children}</div>
    </div>
  );
}
