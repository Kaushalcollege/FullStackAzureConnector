import requests
import datetime

def subscription(access_token: str, client_id: str, notification_url: str, resource: str = "me/mailFolders('Inbox')/messages"):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    expiration_datetime = (datetime.datetime.utcnow() + datetime.timedelta(minutes=60)).isoformat() + "Z"

    payload = {
        "changeType": "created,updated",
        "notificationUrl": f"{notification_url}/webhook/notifications/{client_id}",  # e.g., your ngrok URL + "/webhook/notifications"
        "resource": resource,
        "expirationDateTime": expiration_datetime,
        "clientState": "secretClientValue"  
    }
    response = requests.post("https://graph.microsoft.com/v1.0/subscriptions", headers=headers, json=payload)

    if response.status_code == 201:
        return response.json()["id"]
    else:
        raise Exception(f"Failed to create subscription: {response.text}")