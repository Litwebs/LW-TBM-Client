import { useApp } from "../context/AppContext.jsx";
export default function ToastHost() {
  const { toasts } = useApp();
  return (<div className="toast-host">{toasts.map((t) => <div key={t.id} className="toast">{t.message}</div>)}</div>);
}