
## API Documentation — Shift Data Endpoint

---

### `GET /api/v1/dashboard/shift-data`

Returns per-shift courier capacity cards and summary totals for the latest available data.

---

### Authentication

|Type|Header|
|---|---|
|Bearer JWT|`Authorization: Bearer <token>`|

---

### Request

No query parameters. No request body.

---

### Response `200 OK`

```
{  "shifts": [ShiftCard],  "shiftsWithinTarget": integer,  "shiftsExceeded":     integer,  "totalRemaining":     integer | null,  "totalBooked":        integer | null}
```

#### `ShiftCard` object

|Field|Type|Description|
|---|---|---|
|`shiftName`|`string`|Shift time range, e.g. `"08:00-12:00"`|
|`durationHours`|`number`|Duration of the shift in hours, e.g. `4`|
|`fillRate`|`number`|% of required slots filled (`scheduled / required × 100`), e.g. `77.78`|
|`remaining`|`integer`|Unfilled slots (`required − scheduled`). Negative means exceeded|
|`booked`|`integer`|Number of scheduled couriers|
|`status`|`string`|`"WithinTarget"` \| `"Close"` \| `"Exceeded"`|

#### Status rules

|Value|Condition|
|---|---|
|`"Exceeded"`|`remaining < 0` (scheduled > required)|
|`"Close"`|`remaining <= 1`|
|`"WithinTarget"`|`remaining >= 2`|

#### Root-level summary fields

|Field|Type|Description|
|---|---|---|
|`shiftsWithinTarget`|`integer`|Count of shifts with status `"WithinTarget"`|
|`shiftsExceeded`|`integer`|Count of shifts with status `"Exceeded"`|
|`totalRemaining`|`integer \| null`|Sum of all `remaining` values across all shifts. `null` if no data|
|`totalBooked`|`integer \| null`|Sum of all `booked` values across all shifts. `null` if no data|

---

### Example Response

```
{  "shifts": [    { "shiftName": "00:00-03:00", "durationHours": 3, "fillRate": 77.78, "remaining": 2, "booked":  7, "status": "WithinTarget" },    { "shiftName": "03:00-08:00", "durationHours": 5, "fillRate": 66.67, "remaining": 2, "booked":  4, "status": "WithinTarget" },    { "shiftName": "08:00-12:00", "durationHours": 4, "fillRate": 100,   "remaining": 0, "booked":  9, "status": "Close"        },    { "shiftName": "12:00-16:00", "durationHours": 4, "fillRate": 100,   "remaining": 0, "booked": 14, "status": "Close"        },    { "shiftName": "16:00-20:00", "durationHours": 4, "fillRate": 95.65, "remaining": 1, "booked": 22, "status": "Close"        },    { "shiftName": "20:00-24:00", "durationHours": 4, "fillRate": 92.31, "remaining": 2, "booked": 24, "status": "WithinTarget" }  ],  "shiftsWithinTarget": 3,  "shiftsExceeded": 0,  "totalRemaining": 7,  "totalBooked": 80}
```

---

### Frontend color mapping

|Status|Color|
|---|---|
|`"WithinTarget"`|Green|
|`"Close"`|Orange|
|`"Exceeded"`|Red|

---

### Notes for the frontend

- **Shifts are ordered by `shiftName` alphabetically** — sort by start time on the frontend if you need chronological order (00:00 → 03:00 → 08:00 → 12:00 → 16:00 → 20:00).
- **`remaining` can be negative** when `status = "Exceeded"` — display it as-is (e.g. `-3`).
- **`totalRemaining` / `totalBooked`** are `null` only when the database has no shift data at all; otherwise always integers.
- Data reflects the **most recently imported** Keeta "Shift Details" file — no date filtering is needed in the request.