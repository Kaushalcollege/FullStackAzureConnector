import traceback
from database import get_connection
import json
import datetime
import random
import string


def generate_connector_id():
    random_part = ''.join(random.choices(string.ascii_lowercase + string.digits, k=14))
    return f"c_{random_part}"


def insert_credentials_to_db(Input):
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

    # cursor.execute(
    #     """
    #     INSERT INTO connector_log (app_id, connector_id, document_name, status, created_date, updated_date)
    #     VALUES (%s, %s, %s, %s, %s, %s)
    #     """,
    #     (
    #         Input.client_id,
    #         connector_id,
    #         None,
    #         "CREATED",
    #         now,
    #         now
    #     )
    # )

    conn.commit()
    cursor.close()
    conn.close()

    return connector_id


def get_connector_by_email(email_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT connector_id, config FROM connector WHERE config ->> 'email_id' = %s",
        (email_id,)
    )
    row = cursor.fetchone()
    if not row:
        raise Exception("Connector not found")

    cursor.close()
    conn.close()

    connector_id = row["connector_id"]
    config_json = row["config"]

    print(connector_id)
    print(config_json)
    return connector_id, config_json


def update_tokens_and_log(connector_id, access_token, refresh_token, subscription_id):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.datetime.utcnow()

    cursor.execute(
        """
        UPDATE connector
        SET token = %s::jsonb, updated_date = %s
        WHERE connector_id = %s
        """,
        (
            json.dumps({
                "access_token": access_token,
                "refresh_token": refresh_token,
                "subscription_id": subscription_id
            }),
            now,
            connector_id
        )
    )

    # cursor.execute(
    #     """
    #     UPDATE connector_log
    #     SET status = %s, updated_date = %s
    #     WHERE connector_id = %s
    #     """,
    #     (
    #         "CONNECTED",
    #         now,
    #         connector_id
    #     )
    # )

    conn.commit()
    cursor.close()
    conn.close()


def insert_log_entry(connector_id, client_id, document_name, additional_info, status):
    try:
        conn = get_connection()
        cur = conn.cursor()

        query = """
            INSERT INTO connector_log (
                connector_id, client_id, document_name, additional_info, status, created_date, updated_date
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        now = datetime.datetime.utcnow()
        cur.execute(query, (
            connector_id,
            client_id,
            document_name,
            additional_info,
            status,
            now,
            now
        ))
        conn.commit()
        print(f"Inserted log for {document_name}")
    except Exception as e:
        print(f"Error inserting log: {e}")
        traceback.print_exc()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


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