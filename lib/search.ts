function appendValue(parts: string[], value: unknown): void {
  if (value === null || value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendValue(parts, item);
    }
    return;
  }

  if (typeof value === "object") {
    for (const nestedValue of Object.values(value)) {
      appendValue(parts, nestedValue);
    }
    return;
  }

  parts.push(String(value));
}

export function objectToSearchText(value: unknown): string {
  const parts: string[] = [];
  appendValue(parts, value);
  return parts.join(" ").toLowerCase();
}

export function matchesAnyField(item: unknown, query: string): boolean {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return true;
  }

  return objectToSearchText(item).includes(trimmed);
}

export function filterByQuery<T>(items: T[], query: string): T[] {
  if (!query.trim()) {
    return items;
  }

  return items.filter((item) => matchesAnyField(item, query));
}
