# Auto-Alerts Endpoint — API Documentation

> **Module:** Decision  
> **Card:** التحذيرات التلقائية (Automatic Alerts)  
> **Badge:** بتحدث لحظياً — data reflects the latest imported files, no caching.

---

## Endpoint

```
GET /api/v1/dashboard/auto-alerts
```

### Authentication

```
Authorization: Bearer <access_token>
```

All requests must include a valid JWT. The tenant is resolved automatically from the token — no `companyId` parameter needed.

---

## Response

**Status:** `200 OK`  
**Content-Type:** `application/json`  
**Body:** Array of `AutoAlertDto` objects — **only triggered alerts are included**.  
An **empty array `[]`** means all KPIs are healthy and nothing needs attention.

### AutoAlertDto — Field Reference

| Field | Type | Description |
|---|---|---|
| `severity` | `string` | Alert severity level. Either `"Danger"` (red) or `"Warning"` (orange) |
| `type` | `string` | Identifies which KPI breached. See [Alert Types](#alert-types) below |
| `currentValue` | `number \| null` | The measured KPI value. `null` for `ShiftPeriodExceeded` and `ExpiringDocuments` |
| `threshold` | `number \| null` | The breached threshold value. `null` for `ShiftPeriodExceeded` and `ExpiringDocuments` |
| `shiftName` | `string \| null` | The shift name. Populated **only** for `ShiftPeriodExceeded` alerts |
| `count` | `number \| null` | Document count. Populated **only** for `ExpiringDocuments` alerts |

---

## Alert Types

| `type` value | `severity` | Trigger condition | `currentValue` | `threshold` |
|---|---|---|---|---|
| `OnTimeDelivery` | `"Danger"` | Avg on-time delivery rate **< 99%** | Measured rate (e.g. `94.20`) | `99.0` |
| `RejectionRate` | `"Danger"` | Courier rejection rate **> 0.12%** | Measured rate (e.g. `0.60`) | `0.12` |
| `ShiftAttendance` | `"Warning"` | Avg shift attendance rate **< 98%** | Measured rate (e.g. `84.80`) | `98.0` |
| `ShiftPeriodExceeded` | `"Warning"` | A shift where scheduled couriers **> required** couriers | `null` | `null` |
| `ExpiringDocuments` | `"Danger"` | Any courier document expiring **within 30 days** | `null` | `null` |

> **Note on `ShiftPeriodExceeded`:** Each exceeded shift produces its own separate object in the array.  
> If 3 shifts are exceeded → 3 entries with `type: "ShiftPeriodExceeded"`, each with a different `shiftName`.

> **Note on `currentValue` / `threshold`:** Both are percentage values (0–100 scale), **not** 0–1.  
> Example: `currentValue: 94.20` means 94.20%, not 0.9420.

---

## Example Responses

### All 5 alerts firing (worst case)

```json
[
  {
    "severity": "Danger",
    "type": "OnTimeDelivery",
    "currentValue": 94.20,
    "threshold": 99.0,
    "shiftName": null,
    "count": null
  },
  {
    "severity": "Danger",
    "type": "RejectionRate",
    "currentValue": 0.60,
    "threshold": 0.12,
    "shiftName": null,
    "count": null
  },
  {
    "severity": "Warning",
    "type": "ShiftAttendance",
    "currentValue": 84.80,
    "threshold": 98.0,
    "shiftName": null,
    "count": null
  },
  {
    "severity": "Warning",
    "type": "ShiftPeriodExceeded",
    "currentValue": null,
    "threshold": null,
    "shiftName": "16:00~20:00",
    "count": null
  },
  {
    "severity": "Warning",
    "type": "ShiftPeriodExceeded",
    "currentValue": null,
    "threshold": null,
    "shiftName": "20:00~00:00",
    "count": null
  },
  {
    "severity": "Danger",
    "type": "ExpiringDocuments",
    "currentValue": null,
    "threshold": null,
    "shiftName": null,
    "count": 2
  }
]
```

### All KPIs healthy — nothing to show

```json
[]
```

### Only one alert firing

```json
[
  {
    "severity": "Danger",
    "type": "ExpiringDocuments",
    "currentValue": null,
    "threshold": null,
    "shiftName": null,
    "count": 5
  }
]
```

---

## Frontend Rendering Guide

### Severity → Color mapping

| `severity` | Color | Usage |
|---|---|---|
| `"Danger"` | Red `#EF4444` | Critical — immediate attention needed |
| `"Warning"` | Orange `#F97316` | Caution — monitor closely |

### How to render each alert type

| `type` | Suggested Arabic label | Value display |
|---|---|---|
| `OnTimeDelivery` | التوصيل بالوقت أقل من 99% | Show `currentValue`% vs `threshold`% |
| `RejectionRate` | معدل الرفض تجاوز 0.12% | Show `currentValue`% vs `threshold`% |
| `ShiftAttendance` | حضور الشفتات أقل من 98% | Show `currentValue`% vs `threshold`% |
| `ShiftPeriodExceeded` | الفترة {shiftName} تجاوزت الحد | Show `shiftName` in the label |
| `ExpiringDocuments` | وثائق على وشك الانتهاء (30 يوم) | Show `count` number of documents |

### JavaScript fetch example

```javascript
async function getAutoAlerts(token) {
  const response = await fetch('/api/v1/dashboard/auto-alerts', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const alerts = await response.json(); // AutoAlertDto[]
  return alerts;
}
```

### React rendering example

```jsx
function AutoAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    getAutoAlerts(token).then(setAlerts);
  }, []);

  if (alerts.length === 0) {
    return <p>✅ All KPIs are healthy</p>;
  }

  return (
    <ul>
      {alerts.map((alert, index) => (
        <li
          key={index}
          style={{ color: alert.severity === 'Danger' ? '#EF4444' : '#F97316' }}
        >
          <strong>[{alert.severity}]</strong> {renderLabel(alert)}
        </li>
      ))}
    </ul>
  );
}

function renderLabel(alert) {
  switch (alert.type) {
    case 'OnTimeDelivery':
      return `التوصيل بالوقت: ${alert.currentValue}% (الحد: ${alert.threshold}%)`;
    case 'RejectionRate':
      return `معدل الرفض: ${alert.currentValue}% (الحد: ${alert.threshold}%)`;
    case 'ShiftAttendance':
      return `حضور الشفتات: ${alert.currentValue}% (الحد: ${alert.threshold}%)`;
    case 'ShiftPeriodExceeded':
      return `الفترة ${alert.shiftName} تجاوزت الحد`;
    case 'ExpiringDocuments':
      return `وثائق على وشك الانتهاء: ${alert.count} وثيقة`;
    default:
      return alert.type;
  }
}
```

---

## Error Responses

| Status | When |
|---|---|
| `401 Unauthorized` | Missing or invalid/expired JWT token |
| `500 Internal Server Error` | Unexpected server error |

---

## Data Source

| Alert | Source table | Logic |
|---|---|---|
| `OnTimeDelivery` | `ingestion.courier_rank_plans` | `AVG(OnTimeRate) × 100` from latest import date |
| `RejectionRate` | `ingestion.branch_daily_reports` | `SUM(TaskRejectedCourier) / SUM(TaskAccepted) × 100` from latest import date |
| `ShiftAttendance` | `ingestion.shift_summaries` | `AVG(AttendanceRate) × 100` from latest import date |
| `ShiftPeriodExceeded` | `ingestion.shift_summaries` | Rows where `ScheduledCouriers > RequiredCouriers` from latest import date |
| `ExpiringDocuments` | `courier.couriers` + `courier.courier_vehicles` | Count of document fields (`IdExpiryDate`, `DriverCardExpiry`, `LicenseExpiryDate`, `OperationCardExpiry`) expiring within 30 days |

---

*Last updated: 2026-04-29*
