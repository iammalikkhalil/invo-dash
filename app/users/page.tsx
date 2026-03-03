"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import UserCard from "@/components/UserCard";
import { api, getErrorMessage, isUnauthorizedError } from "@/lib/api";
import { clearAccessToken, isLoggedIn } from "@/lib/auth";
import { filterByQuery } from "@/lib/search";
import type { WebpanelUserResponse } from "@/lib/types";

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<WebpanelUserResponse[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleUnauthorized = useCallback(() => {
    clearAccessToken({ sessionExpired: true });
    router.replace("/login");
  }, [router]);

  const loadUsers = useCallback(async () => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.getAllUsers();
      setUsers(response ?? []);
    } catch (loadError) {
      if (isUnauthorizedError(loadError)) {
        handleUnauthorized();
        return;
      }

      setError(getErrorMessage(loadError, "Failed to load users."));
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized, router]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => filterByQuery(users, query), [users, query]);

  return (
    <main className="page-wrap">
      <Navbar title="Users" />
      <section className="content-wrap">
        <SearchBar
          value={query}
          onChange={setQuery}
          label="Search Users"
          placeholder="Search users by any field"
        />

        {isLoading ? <LoadingState message="Loading users..." /> : null}

        {!isLoading && error ? <ErrorState message={error} onRetry={loadUsers} /> : null}

        {!isLoading && !error && users.length === 0 ? (
          <EmptyState message="No users found." />
        ) : null}

        {!isLoading && !error && users.length > 0 ? (
          filteredUsers.length > 0 ? (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onClick={() => router.push(`/users/${user.id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No users match your search." />
          )
        ) : null}
      </section>
    </main>
  );
}
