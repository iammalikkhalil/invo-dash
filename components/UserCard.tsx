import type { WebpanelUserResponse } from "@/lib/types";
import { fallbackText, formatDate } from "@/lib/format";

interface UserCardProps {
  user: WebpanelUserResponse;
  onClick: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  return (
    <button type="button" className="user-card" onClick={onClick}>
      <h3>{fallbackText(user.username, "No Username")}</h3>
      <p><strong>Email:</strong> {fallbackText(user.email)}</p>
      <p><strong>Phone:</strong> {fallbackText(user.phoneNumber)}</p>
      <p><strong>Role:</strong> {fallbackText(user.role)}</p>
      <p><strong>Status:</strong> {user.isActive ? "Active" : "Inactive"}</p>
      <p><strong>Created:</strong> {formatDate(user.createdAt)}</p>
    </button>
  );
}
