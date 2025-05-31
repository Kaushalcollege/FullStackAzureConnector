import traceback
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from db.outlook_db import (
    insert_credentials_to_db,
    get_connector_by_email,
    update_tokens_and_log,
    insert_log_entry,
    get_connector_by_email_by_client_id,
    message_already_processed
)
import requests
import json
import datetime
from fastapi import Request
from fastapi.responses import PlainTextResponse
from routes.subscribe import subscription

outlook_router = APIRouter()

SCOPES = ["Mail.Read", "User.Read", "profile openid email", "Mail.ReadWrite"]

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

        notification_url = "https://03f0-183-82-117-42.ngrok-free.app"
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
async def handle_notification(client_id: str, request: Request):
    validation_token = request.query_params.get("validationToken")
    if validation_token:
        print(f"Received validation for client_id: {client_id}")
        return PlainTextResponse(content=validation_token, status_code=200)

    try:
        body = await request.json()
        print("Received notification: ", body)

        for item in body.get("value", []):
            message_id = item.get("resourceData", {}).get("id")
            if not message_id:
                continue

            # Check if message was already processed
            if message_already_processed(message_id):  # You must define this function
                print(f"Skipping duplicate message_id: {message_id}")
                continue

            print(f"Looking up connector config for client_id: {client_id}")
            connector_id, config, access_token = get_connector_by_email_by_client_id(client_id)
            print(f"Found connector_id: {connector_id}")

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }

            # Fetch message
            message_url = f"https://graph.microsoft.com/v1.0/me/messages/{message_id}"
            response = requests.get(message_url, headers=headers)
            if response.status_code != 200:
                print(f"Failed to fetch message: {response.text}")
                continue

            mail = response.json()
            subject = mail.get("subject", "No Subject")
            sender = mail.get("from", {}).get("emailAddress", {}).get("address")
            attachments_info = []

            # Fetch attachments
            attachments_url = f"https://graph.microsoft.com/v1.0/me/messages/{message_id}/attachments"
            attach_resp = requests.get(attachments_url, headers=headers)
            if attach_resp.status_code in (200, 202):
                attachments = attach_resp.json().get("value", [])
                for att in attachments:
                    attachments_info.append({
                        "name": att.get("name"),
                        "size": att.get("size"),
                        "contentType": att.get("contentType")
                    })
            else:
                print(f"No attachments or failed: {attach_resp.text}")

            # Insert log entries
            for att in attachments_info:
                insert_log_entry(
                    connector_id=connector_id,
                    client_id=client_id,
                    document_name=att.get("name"),
                    additional_info=json.dumps({
                        "subject": subject,
                        "sender": sender,
                        "attachment_metadata": att
                    }),
                    status="fetched",
                    message_id=message_id  # New field
                )

            # Mark message as read to avoid re-triggering
            mark_read_url = f"https://graph.microsoft.com/v1.0/me/messages/{message_id}"
            mark_resp = requests.patch(mark_read_url, headers=headers, json={"isRead": True})
            if mark_resp.status_code != 200:
                print(f"Failed to mark email as read: {mark_resp.text}")

        return JSONResponse(content={"status": "Processed"}, status_code=202)

    except Exception as e:
        print(f"Webhook error: {e}")
        traceback.print_exc()
        return JSONResponse(content={"error": "Internal Server Error"}, status_code=500)
