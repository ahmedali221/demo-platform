# Violations Module — API Documentation

> **Base URL:** `https://{host}/api/v1`
> **Auth:** All endpoints require `Authorization: Bearer <token>` header.

---

## 1. Get Platform Providers (Dropdown List)

Fetch the list of available platforms to populate the **المنصة** dropdown.
Call this once when the page loads.

```
GET /api/v1/violations/providers
```

### Request

No parameters. No request body.

### Response `200 OK`

```json
[
  { "value": 1, "label": "Keeta" },
  { "value": 2, "label": "HungerStation" }
]
```

| Field   | Type     | Description                                              |
|---------|----------|----------------------------------------------------------|
| `value` | `integer`| The numeric ID to pass as `?provider=` to the counter    |
| `label` | `string` | The display name to show in the dropdown                 |

### Example (JavaScript)

```js
const res = await fetch('/api/v1/violations/providers', {
  headers: { Authorization: `Bearer ${token}` }
});
const providers = await res.json();
// providers = [{ value: 1, label: "Keeta" }, ...]
```

---

## 2. Get Violations Counter (Card Data)

Returns violation counts for the **current month**, optionally filtered by the
platform selected from the dropdown.

```
GET /api/v1/violations/counter?provider={value}
```

### Query Parameters

| Parameter  | Type      | Required | Description                                                                 |
|------------|-----------|----------|-----------------------------------------------------------------------------|
| `provider` | `integer` | ❌ No    | The `value` from the providers endpoint. Omit to return **all platforms**.  |

### Response `200 OK`

```json
{
  "total":   247,
  "active":  189,
  "invalid":  58
}
```

| Field     | Type      | UI Label (Arabic)      | Description                          |
|-----------|-----------|------------------------|--------------------------------------|
| `total`   | `integer` | إجمالي المخالفات       | Total violations this month          |
| `active`  | `integer` | الفاعلة *(red)*        | Violations not yet resolved          |
| `invalid` | `integer` | الباطلة *(green)*      | Violations marked as resolved/voided |

> **Note:** `total` always equals `active + invalid`.

### Examples

```
GET /api/v1/violations/counter
→ All platforms (default on page load)

GET /api/v1/violations/counter?provider=1
→ Keeta only

GET /api/v1/violations/counter?provider=2
→ HungerStation only
```

### Example (JavaScript)

```js
// Default — all platforms
const res = await fetch('/api/v1/violations/counter', {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await res.json();
// data = { total: 247, active: 189, invalid: 58 }

// Filtered — Keeta only (provider value comes from /providers endpoint)
const res = await fetch('/api/v1/violations/counter?provider=1', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## End-to-End Frontend Flow

```
1. Page loads
   └─ GET /api/v1/violations/providers
      → Populate المنصة dropdown with { value, label } items
      → Set default selection to "All" (no provider param)

2. On page load / default state
   └─ GET /api/v1/violations/counter
      → Display:  إجمالي المخالفات = total
                  الفاعلة          = active
                  الباطلة          = invalid

3. User selects a platform from the dropdown (e.g. "Keeta")
   └─ GET /api/v1/violations/counter?provider=1   ← use value from step 1
      → Re-render the three counters with filtered data
```

---

## Provider Values Reference

| `value` | `label`        |
|---------|----------------|
| `1`     | Keeta          |
| `2`     | HungerStation  |

---

## Error Responses

| Status | When                                      |
|--------|-------------------------------------------|
| `401`  | Missing or invalid Bearer token           |
| `400`  | `provider` value is not a valid integer   |
