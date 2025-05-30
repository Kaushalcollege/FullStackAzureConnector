import traceback
from database import get_connection
import json
import datetime
import random
import string


def get_connector_by_email_by_client_id(client_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT connector_id, config, token FROM connector WHERE config ->> 'client_id' = %s",
        (client_id,)
    )
    row = cursor.fetchone()

    if not row:
        raise Exception("Connector not found for client_id")

    cursor.close()
    conn.close()

    connector_id = row["connector_id"]
    config_json = row["config"]
    token_json = row["token"]

    access_token = token_json.get("access_token")

    print(f"connector_id: {connector_id}")
    print(f"access_token: {access_token}")

    return connector_id, config_json, access_token

get_connector_by_email_by_client_id("79c373d6-0f69-45d9-bf20-8160081e372a")