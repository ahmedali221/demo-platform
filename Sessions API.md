Sessions API
All endpoints require authentication via the access_token HttpOnly cookie set at login.

1. List My Sessions
GET /api/v1/me/sessions

Returns all active sessions for the currently logged-in user.

Response 200 OK

[
  {
    "sessionId": "a362e0ef-b3ab-48f8-ba48-343b8cecfea7",
    "deviceName": "Chrome — Windows 11",
    "location": "الرياض، SA",
    "lastActivityAt": "2026-05-04T12:13:43Z",
    "isCurrent": true
  },
  {
    "sessionId": "35aaab87-8800-4fbb-9c8f-3de9c67171c9",
    "deviceName": "Safari — iPhone 15",
    "location": "جدة، SA",
    "lastActivityAt": "2026-05-04T10:00:00Z",
    "isCurrent": false
  }
]
Field	Type	Description
sessionId	guid	Use this to revoke a specific session
deviceName	string	Browser and OS parsed from User-Agent
location	string | null	City and country. null when running on localhost
lastActivityAt	datetime	UTC. Use this to show "منذ 2 ساعة" relative time
isCurrent	bool	true for the session making this request
2. Revoke One Session
DELETE /api/v1/me/sessions/{sessionId}

Immediately terminates a specific session. The access token linked to that session is blacklisted — the device is kicked out on its next request.

URL parameter

Param	Type	Description
sessionId	guid	ID from the sessions list
Responses

Status	Meaning
204 No Content	Session revoked
400 Bad Request	Session belongs to another user or does not exist
400 body

{ "code": "Session.NotFound", "message": "Session not found." }
The current session (where isCurrent: true) can also be revoked via this endpoint. The frontend should warn the user before doing so.

3. End All Sessions
DELETE /api/v1/me/sessions

Terminates every active session for the current user across all devices, including the one making this request. Clears auth cookies.

Responses

Status	Meaning
204 No Content	All sessions revoked, cookies cleared
After 204, redirect the user to the login page.

4. Logout (Current Session Only)
POST /api/v1/auth/logout

Ends only the session making the request. Other devices stay logged in.

Responses

Status	Meaning
204 No Content	Current session ended, cookies cleared
Use this for the standard logout button. Use End All Sessions for "تسجيل الخروج من جميع الأجهزة".

5. Admin — View Sessions
GET /api/v1/admin/sessions

Roles: Admin, SuperAdmin

Caller	Behavior
Admin	Returns sessions for their own tenant's users only
SuperAdmin	Returns all sessions across all tenants
SuperAdmin with ?tenantId=	Returns sessions for that specific tenant only
Query parameters

Param	Type	Required	Description
tenantId	guid	No	SuperAdmin only — filter by tenant
Response 200 OK

[
  {
    "sessionId": "a362e0ef-b3ab-48f8-ba48-343b8cecfea7",
    "userId": "19c21fd0-3266-44e4-addb-3dc6f0199890",
    "userEmail": "user@tenant-a.com",
    "tenantId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "deviceName": "Chrome — Windows 11",
    "location": "الرياض، SA",
    "lastActivityAt": "2026-05-04T12:13:43Z"
  }
]
Field	Type	Description
sessionId	guid	Session identifier
userId	guid	Owner of the session
userEmail	string	Email of the session owner
tenantId	guid	Tenant the user belongs to
deviceName	string	Browser and OS
location	string | null	City and country
lastActivityAt	datetime	UTC
Notes for the frontend
Relative time: lastActivityAt is UTC. Convert to local time and display as relative (e.g. "الآن", "منذ 2 ساعة", "منذ أمس").

Location: Can be null in local/dev environments. Always guard against null before rendering.

deviceName fallback: Value is always a non-empty string. Default is "Unknown Device" when the User-Agent could not be parsed.

"الحالية" badge: Use isCurrent: true to highlight the current session row (endpoint 1 only).

Terminate current session warning: If the user clicks "إنهاء" on the row where isCurrent: true, show a confirmation before calling endpoint 2 or 3.