from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from database import get_connection
import datetime
import json
import random
import string
import requests  # For token exchange

app = FastAPI()

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

SCOPES = ["Mail.Read", "User.Read", "profile openid email"]
# ---------- Models ----------
class Credentials(BaseModel):
    tenant_id: str
    client_id: str
    client_secret: str
    email_id: str


class ExchangeRequest(BaseModel):
    auth_code: str
    email_id: str


# ---------- Helpers ----------
def generate_connector_id():
    random_part = ''.join(random.choices(string.ascii_lowercase + string.digits, k=14))
    return f"c_{random_part}"


# ---------- Routes ----------
@app.post("/credentials")
def add_credentials(Input: Credentials):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        connector_id = generate_connector_id()
        now = datetime.datetime.utcnow()

        config = {
            "tenant_id": Input.tenant_id,
            "client_id": Input.client_id,
            "client_secret": Input.client_secret,
            "email_id": Input.email_id
        }

        empty_token = {
            "access_token": None,
            "refresh_token": None
        }

        # Insert into connector table
        cursor.execute(
            """
            INSERT INTO connector (connector_id, type, app_id, config, created_date, updated_date, token)
            VALUES (%s, %s, %s, %s::jsonb, %s, %s, %s::jsonb)
            """,
            (
                connector_id,
                "outlook",
                Input.client_id,
                json.dumps(config),
                now,
                now,
                json.dumps(empty_token)
            )
        )

        # Insert into connector_log table
        cursor.execute(
            """
            INSERT INTO connector_log (app_id, connector_id, document_name, status, created_date, updated_date)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                Input.client_id,
                connector_id,
                None,
                "CREATED",
                now,
                now
            )
        )

        conn.commit()
        cursor.close()
        conn.close()

        return JSONResponse(content={"connector_id": connector_id})

    except Exception as e:
        print(f"Error in /credentials: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/exchange-token")
def exchange_token(data: ExchangeRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Fetch config by email_id
        cursor.execute(
            "SELECT connector_id, config FROM connector WHERE config ->> 'email_id' = %s",
            (data.email_id,)
        )
        result = cursor.fetchone()
        print(result)
        print(result['connector_id'])
        print(result['config'])

        if not result:
            raise HTTPException(status_code=404, detail="No connector found for this email")

        connector_id, config_json = result['connector_id'], result['config']
        config = config_json

        tenant_id = config["tenant_id"]
        client_id = config["client_id"]
        client_secret = config["client_secret"]

        # Microsoft OAuth2 Token Endpoint
        token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        redirect_uri = "http://localhost:5173/auth/callback"

        print(" ".join(SCOPES))
        payload = {
            "client_id": client_id,
            "client_secret": client_secret,
            "code": data.auth_code,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
            "scope": " ".join(SCOPES),
        }
        token_response = requests.post(token_url, data=payload)

        if token_response.status_code != 200:
            print(token_response.text)
            raise HTTPException(status_code=400, detail="Token exchange failed")

        token_data = token_response.json()
        print(token_data)
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")

        now = datetime.datetime.utcnow()

        # Update token in connector table
        cursor.execute(
            """
            UPDATE connector
            SET token = %s::jsonb, updated_date = %s
            WHERE connector_id = %s
            """,
            (
                json.dumps({
                    "access_token": access_token,
                    "refresh_token": refresh_token
                }),
                now,
                connector_id
            )
        )

        # Update status in connector_log table
        cursor.execute(
            """
            UPDATE connector_log
            SET status = %s, updated_date = %s
            WHERE connector_id = %s
            """,
            (
                "CONNECTED",
                now,
                connector_id
            )
        )

        conn.commit()
        cursor.close()
        conn.close()

        return {"message": "Token exchanged successfully"}

    except Exception as e:
        print(f"Error in /exchange-token: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
