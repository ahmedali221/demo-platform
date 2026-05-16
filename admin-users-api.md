# Admin Users API — Team Members

Base URL: `{{base_url}}/api/v1/admin/users`

All endpoints require a valid `access_token` cookie and the caller must have role **Admin** or **SuperAdmin**.

---

## Role behavior summary

| Action | Admin | SuperAdmin |
|---|---|---|
| List users | Own tenant only | Any tenant via `?tenantId=` |
| Create user | Own tenant only | Any tenant via body `tenantId` |
| Edit / Deactivate / Activate | Own tenant only | Any tenant (no restriction) |
| Delete | — | — (not supported, use deactivate) |

---

## Endpoints

### 1. List Users

```
GET /api/v1/admin/users
GET /api/v1/admin/users?tenantId={tenantId}   ← SuperAdmin only
```

**Response `200 OK`**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "tenantId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "ahmed@company.com",
    "role": "Admin",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "profilePhotoUrl": "https://...",
    "isActive": true,
    "isCurrent": true,
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

**Notes:**
- `isCurrent: true` marks the logged-in user's own row — use it to render the **"أنت"** badge and hide action buttons for that row.
- `profilePhotoUrl` may be `null` — fall back to a colored circle with the user's initial.
- `role` is a string: `"Admin"`, `"Operator"`, `"Viewer"`, `"SuperAdmin"`, `"Courier"`.

---

### 2. Create User

```
POST /api/v1/admin/users
Content-Type: application/json
```

**Request body**
```json
{
  "email": "user@company.com",
  "password": "Pass@1234",
  "role": 1,
  "tenantId": "9b1deb4d-..."   // ← SuperAdmin only, ignored for Admin
}
```

**Role enum values**

| Value | Name |
|---|---|
| `0` | Viewer |
| `1` | Operator |
| `2` | Admin |
| `3` | SuperAdmin |
| `4` | Courier |

**Response `200 OK`**
```json
{
  "id": "3fa85f64-...",
  "tenantId": "9b1deb4d-...",
  "email": "user@company.com",
  "role": "Operator",
  "createdAt": "2026-05-04T12:00:00Z",
  "isActive": true
}
```

**Error responses**

| Code | Error | Meaning |
|---|---|---|
| `400` | `User.EmailTaken` | Email already registered |
| `400` | `Tenant.NotFound` | Provided tenantId does not exist |

---

### 3. Edit User

```
PUT /api/v1/admin/users/{id}
Content-Type: application/json
```

**Request body** — all fields optional, send only what changed
```json
{
  "email": "new@company.com",
  "role": 2
}
```

**Response `200 OK`** — same shape as Create response.

**Error responses**

| Code | Error | Meaning |
|---|---|---|
| `400` | `User.NotFound` | User doesn't exist or belongs to another tenant |
| `400` | `User.EmailTaken` | New email already in use by another user |

---

### 4. Deactivate User  *(إزالة)*

```
POST /api/v1/admin/users/{id}/deactivate
```

No request body.

**Response `204 No Content`**

**Error responses**

| Code | Error | Meaning |
|---|---|---|
| `400` | `User.NotFound` | User doesn't exist or belongs to another tenant |
| `400` | `User.AlreadyInactive` | User is already deactivated |

---

### 5. Activate User

```
POST /api/v1/admin/users/{id}/activate
```

No request body.

**Response `204 No Content`**

**Error responses**

| Code | Error | Meaning |
|---|---|---|
| `400` | `User.NotFound` | User doesn't exist or belongs to another tenant |
| `400` | `User.AlreadyActive` | User is already active |

---

## Error response shape

All `400` responses return:
```json
{
  "code": "User.NotFound",
  "message": "User not found."
}
```

---

## UI mapping

| UI element | Field |
|---|---|
| Colored circle / avatar | `profilePhotoUrl` → fallback to first letter of `firstName` |
| Full name | `firstName + " " + lastName` |
| Email | `email` |
| Role badge | `role` |
| "أنت" badge | `isCurrent === true` |
| Edit button | `PUT /admin/users/{id}` — hide if `isCurrent` |
| إزالة button | `POST /admin/users/{id}/deactivate` — hide if `isCurrent` |
| Reactivate | `POST /admin/users/{id}/activate` — show if `isActive === false` |

---

## Important notes

1. **No permanent delete** — the only removal action is deactivate. A deactivated user still appears in the list with `isActive: false`.
2. **Tenant isolation** — an Admin cannot edit, deactivate, or activate users outside their own tenant. The API returns `User.NotFound` in that case (not a 403).
3. **`isCurrent` row** — always hide Edit and إزالة buttons for the row where `isCurrent: true` to prevent an admin from deactivating themselves.
