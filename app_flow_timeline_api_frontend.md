# App Flow Timeline API Documentation

Frontend reference for the activity timeline API implemented in `invotick-apis`.

Response shape:

This endpoint returns the payload directly. It does not use the standard backend `ApiResponse<T>` wrapper.

```json
{
  "deviceId": "string | null",
  "userId": "uuid | null",
  "appVersion": "string | null",
  "from": "ISO_DATE | null",
  "to": "ISO_DATE | null",
  "totalSessions": 0,
  "totalEvents": 0,
  "sessions": []
}
```

---

## 1. Authentication

- `GET /v2/admin/analytics/timeline`

Send the normal bearer token:

```http
Authorization: Bearer <jwt_token>
```

Frontend note:

- this is an admin analytics endpoint
- use the normal admin bearer token

---

## 2. Endpoint

`GET /v2/admin/analytics/timeline`

### Purpose

Return a complete ordered activity timeline for a device ID or user ID. Sessions are returned in chronological order, and each session includes all events ordered chronologically with `gapSec` values.

### Default behavior

- if `from` and `to` are omitted, backend fetches the latest 30 matching sessions
- those sessions are selected by `startTime DESC`
- response still returns sessions in `startTime ASC`

---

## 3. Query Params

- `deviceId`: optional string
- `userId`: optional UUID
- `appVersion`: optional exact app version match
- `from`: optional UTC timestamp in ISO-8601 format
- `to`: optional UTC timestamp in ISO-8601 format

### Rules

- at least one of `deviceId` or `userId` must be provided
- `from` and `to` must be provided together if used
- if `from` and `to` are omitted, backend returns the last 30 matching sessions

### Identity filter behavior

- if only `deviceId` is sent, backend returns sessions for that device
- if only `userId` is sent, backend returns sessions for that user
- if both are sent, backend returns sessions matching either `deviceId` or `userId`

---

## 4. Request Examples

### By user ID

```http
GET /v2/admin/analytics/timeline?userId=b12abeda-98e9-4757-9b57-7bca2ad562af
Authorization: Bearer <jwt_token>
```

### By device ID with date range

```http
GET /v2/admin/analytics/timeline?deviceId=device-123&from=2026-04-20T00:00:00Z&to=2026-04-21T00:00:00Z
Authorization: Bearer <jwt_token>
```

### cURL example

```bash
curl --request GET \
  --url "http://<host>:8082/v2/admin/analytics/timeline?userId=b12abeda-98e9-4757-9b57-7bca2ad562af" \
  --header "Authorization: Bearer <jwt_token>"
```

---

## 5. Selection And Ordering

- session filter uses `deviceId OR userId`
- optional `appVersion` narrows matching sessions
- if date range is present, sessions must satisfy `startTime BETWEEN from AND to`
- if date range is absent, backend fetches the latest 30 sessions by `startTime DESC` and returns them sorted ascending
- returned sessions are always sorted by `startTime ASC`
- events inside each session are always sorted by `eventTimestamp ASC`

---

## 6. Gap Semantics

- first event gap: `eventTimestamp - session.startTime`
- later event gap: `currentEventTimestamp - previousEventTimestamp`
- `gapSec` is returned in seconds as a decimal number

---

## 7. Response Structure

### Top-level fields

- `deviceId`: resolved device filter value
- `userId`: resolved user filter value
- `appVersion`: resolved app version filter value
- `from`: resolved range start, or `null` when using last-30-sessions fallback
- `to`: resolved range end, or `null` when using last-30-sessions fallback
- `totalSessions`: number of returned sessions
- `totalEvents`: total event count across all returned sessions
- `sessions`: ordered timeline sessions

### Session fields

- `sessionId`: analytics session ID
- `startTime`: session start timestamp
- `endTime`: session end timestamp, or `null`
- `totalEvents`: number of events in that session
- `events`: ordered event list

### Event fields

- `eventName`: analytics event name
- `screenName`: extracted screen name if present
- `timestamp`: event timestamp
- `gapSec`: elapsed seconds from session start for first event, otherwise from the previous event

---

## 8. Example Response

```json
{
  "deviceId": "device-123",
  "userId": null,
  "appVersion": null,
  "from": "2026-04-20T00:00:00Z",
  "to": "2026-04-21T00:00:00Z",
  "totalSessions": 1,
  "totalEvents": 2,
  "sessions": [
    {
      "sessionId": "123e4567-e89b-12d3-a456-426614174000",
      "startTime": "2026-04-20T10:00:00Z",
      "endTime": "2026-04-20T10:05:00Z",
      "totalEvents": 2,
      "events": [
        {
          "eventName": "Splash",
          "screenName": "Splash",
          "timestamp": "2026-04-20T10:00:01Z",
          "gapSec": 1.0
        },
        {
          "eventName": "Home",
          "screenName": "Home",
          "timestamp": "2026-04-20T10:00:03Z",
          "gapSec": 2.0
        }
      ]
    }
  ]
}
```

### Empty state

```json
{
  "deviceId": "device-123",
  "userId": null,
  "appVersion": null,
  "from": "2026-04-20T00:00:00Z",
  "to": "2026-04-21T00:00:00Z",
  "totalSessions": 0,
  "totalEvents": 0,
  "sessions": []
}
```

---

## 9. Error Cases

### Missing identity filter

```json
{
  "success": false,
  "message": "At least one of 'deviceId' or 'userId' must be provided.",
  "data": null
}
```

### Partial date range

```json
{
  "success": false,
  "message": "Both 'from' and 'to' must be provided together.",
  "data": null
}
```

### Invalid date range

```json
{
  "success": false,
  "message": "Invalid range: 'to' must be after 'from'.",
  "data": null
}
```

### Auth failure

If token is missing or invalid, backend returns the normal auth error response for protected endpoints.

---

## 10. TypeScript Interfaces

```ts
export interface AppFlowTimelineResponse {
  deviceId: string | null;
  userId: string | null;
  appVersion: string | null;
  from: string | null;
  to: string | null;
  totalSessions: number;
  totalEvents: number;
  sessions: AppFlowTimelineSession[];
}

export interface AppFlowTimelineSession {
  sessionId: string;
  startTime: string;
  endTime: string | null;
  totalEvents: number;
  events: AppFlowTimelineEvent[];
}

export interface AppFlowTimelineEvent {
  eventName: string;
  screenName: string | null;
  timestamp: string;
  gapSec: number;
}
```

---

## 11. Example Fetch Call

```ts
const params = new URLSearchParams({
  userId: "b12abeda-98e9-4757-9b57-7bca2ad562af",
});

const res = await fetch(`/v2/admin/analytics/timeline?${params.toString()}`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const json: AppFlowTimelineResponse = await res.json();
```

### Example with date range

```ts
const params = new URLSearchParams({
  userId: "b12abeda-98e9-4757-9b57-7bca2ad562af",
  from: "2026-04-20T00:00:00Z",
  to: "2026-04-22T23:59:59Z",
  appVersion: "1.3.0",
});

const res = await fetch(`/v2/admin/analytics/timeline?${params.toString()}`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const json: AppFlowTimelineResponse = await res.json();
```
