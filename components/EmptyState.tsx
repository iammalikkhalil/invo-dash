interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="state-box">
      <p>{message}</p>
    </div>
  );
}
