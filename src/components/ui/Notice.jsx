import { Alert } from './alert.jsx';

export default function Notice({ type = 'info', children, id, ...props }) {
  return <Alert variant={type === 'error' ? 'error' : type} id={id} {...props}>{children}</Alert>;
}
