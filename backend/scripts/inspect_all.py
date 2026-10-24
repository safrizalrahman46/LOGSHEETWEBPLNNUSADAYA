import sqlite3
import os
import psycopg2

print("=== CHECKING PLN_HAR SQLITE ===")
har_db = r"d:\PLN PROJECT\PLN_HAR\backend\db.sqlite3"
if os.path.exists(har_db):
    conn = sqlite3.connect(har_db)
    cur = conn.cursor()
    tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    print("Tables in PLN_HAR:", tables)
    for t in ['api_unit', 'api_machine', 'api_harreport', 'api_amcreport']:
        if t in tables:
            cnt = cur.execute(f"SELECT count(*) FROM {t}").fetchone()[0]
            cols = [c[1] for c in cur.execute(f"PRAGMA table_info({t})").fetchall()]
            print(f"Table {t} ({cnt} rows):")
            print("  Cols:", cols)
            for row in cur.execute(f"SELECT * FROM {t} LIMIT 3").fetchall():
                print("   ", row)
    conn.close()
else:
    print("PLN_HAR db not found at", har_db)

print("\n=== CHECKING PLN_NUSA_DAYA_APPS ===")
app_dir = r"d:\PLN PROJECT\PLN_NUSA_DAYA_APPS"
if os.path.exists(app_dir):
    print("Files in PLN_NUSA_DAYA_APPS:")
    for f in os.listdir(app_dir):
        print(" -", f)
backend_dir = os.path.join(app_dir, "backend")
if os.path.exists(backend_dir):
    print("Files in PLN_NUSA_DAYA_APPS/backend:")
    for f in os.listdir(backend_dir):
        print(" -", f)

print("\n=== CHECKING POSTGRESQL (PLTD_LOGSHEET on 5434) ===")
try:
    pg_conn = psycopg2.connect(
        host="localhost",
        port=5434,
        database="pltd_logsheet",
        user="postgres",
        password="viera"
    )
    pg_cur = pg_conn.cursor()
    pg_cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    pg_tables = [r[0] for r in pg_cur.fetchall()]
    print("Tables in PostgreSQL:", pg_tables)
    for t in ['units', 'machines', 'har_tickets', 'amc_reports', 'logsheet_records', 'logsheet_details', 'notifications']:
        if t in pg_tables:
            pg_cur.execute(f"SELECT count(*) FROM {t}")
            cnt = pg_cur.fetchone()[0]
            print(f"PostgreSQL {t}: {cnt} rows")
    pg_conn.close()
except Exception as e:
    print("PostgreSQL connection error:", e)
