type Props = {
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
};

export function EmptyState({ title, body, action }: Props) {
  return (
    <div className="vh-empty">
      <h2>{title}</h2>
      <p>{body}</p>
      {action && (
        <button type="button" className="btn" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
