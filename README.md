# Outlook Connector (FastAPI + PostgreSQL)

This project listens to Outlook inbox events (e.g., new emails) using Microsoft Graph API webhooks, stores config & tokens in PostgreSQL, and uploads email attachments to an external API.

## Prerequisites

- Python 3.10+
- PostgreSQL
- Ngrok (for development webhook testing)
- Microsoft 365 Work/School Account (not personal MSA)
- fastapi
- uvicorn
- httpx
- python-dotenv
- psycopg2-binary

---

## Step 1: Register App in Azure Portal

1. Go to: https://portal.azure.com
2. Navigate to **Azure Active Directory > App registrations > New registration**
3. Enter a name, e.g., `OutlookConnectorApp`
4. Redirect URI: (optional, can leave blank for now)
5. Click **Register**

---

## Step 2: Generate Client Secret

1. After registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description and choose expiry (e.g., 6 months)
4. Save the generated `Value` (this is your `client_secret`)

---

## Step 3: API Permissions

1. Go to **API Permissions**
2. Click **Add a permission > Microsoft Graph**
3. Choose **Delegated permissions**
4. Add:
   - `Mail.Read`
   - `profile openid email`
   - `User.Read`
   - `Mail.ReadWrite`
5. Click **Grant admin consent**

---

## Step 4: "frontend" workflow:

1. The "frontend" folder consists of a nested folder called **Components**.
2. This "Components" folder consists of 5 files: 1. RightSlideModal.jsx 2. RightSlideModal.css 3. FormField.jsx 4. FormField.css 5. AuthRedirect.jsx
3. The RightSlideModal.jsx posts to the "/credentials" end-point.
4. The AuthRedirect.jsx posts to the "/exchange-token" endpoint.

## Step 5: "backend" workflow:

1. We have 2 directories -- routes, db and 2 files -- main2.py, database.py
2. routes consists of outlook.py and subscribe.py
3. db consists of outlook_db.py
4. All the database methods are defined in the outlook_db.py, they are then imported into outlook.py
5. All the input models will be defined in the outlook.py code.
6. class Credentials(BaseModel):
   tenant_id: str
   client_id: str
   client_secret: str
   email_id: str
   app_id: str

   class ExchangeRequest(BaseModel):
   auth_code: str
   email_id: str
   app_id: str

7. Three API routes are defined namely:
   @outlook_router.post("/credentials")
   def add_credentials(Input: Credentials):

   @outlook_router.post("/exchange-token")
   def exchange_token(data: ExchangeRequest):

   @outlook_router.api_route("/webhook/notifications/{client_id}", methods=["GET", "POST"])

8. The Database credentials are defined in database.py
9. the subscription is created by subscribe.py
