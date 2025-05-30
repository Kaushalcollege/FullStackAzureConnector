import traceback
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from db.outlook_db import (
    insert_credentials_to_db,
    get_connector_by_email,
    update_tokens_and_log
)
import requests
import json
import datetime
from fastapi import Request
from fastapi.responses import PlainTextResponse
from routes.subscribe import subscription

outlook_router = APIRouter()

SCOPES = ["Mail.Read", "User.Read", "profile openid email"]

class Credentials(BaseModel):
    tenant_id: str
    client_id: str
    client_secret: str
    email_id: str

class ExchangeRequest(BaseModel):
    auth_code: str
    email_id: str


@outlook_router.post("/credentials")
def add_credentials(Input: Credentials):
    try:
        connector_id = insert_credentials_to_db(Input)
        return JSONResponse(content={"connector_id": connector_id})
    except Exception as e:
        print(f"Error in /credentials: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@outlook_router.post("/exchange-token")
def exchange_token(data: ExchangeRequest):
    try:
        connector_id, config = get_connector_by_email(data.email_id)
        # config = json.loads(config_json) 
        print(connector_id)
        print(config)

        tenant_id = config["tenant_id"]
        client_id = config["client_id"]
        client_secret = config["client_secret"]

        token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        redirect_uri = "http://localhost:5173/auth/callback"

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
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")

        notification_url = "https://59bf-183-82-117-42.ngrok-free.app"
        subscription_id = subscription(
            access_token=access_token,
            client_id=client_id,
            notification_url=notification_url
        )


        update_tokens_and_log(connector_id, access_token, refresh_token, subscription_id)

        return {"message": "Token exchanged successfully"}
    except Exception as e:
        traceback.print_exc()  
        print(f"Error in /exchange-token: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@outlook_router.api_route("/webhook/notifications/{client_id}", methods=["GET", "POST"])
async def validate_subscription(client_id: str, request: Request):
    print(f"Received validation for client_id: {client_id}")
    validation_token = request.query_params.get("validationToken")
    if validation_token:
        return PlainTextResponse(content=validation_token, status_code=200)
    return PlainTextResponse(status_code=400)
