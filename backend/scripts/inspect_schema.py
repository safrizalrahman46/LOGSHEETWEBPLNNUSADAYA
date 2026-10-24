import psycopg2

conn = psycopg2.connect(host='localhost', port=5434, database='pltd_logsheet', user='postgres', password='viera')
cur = conn.cursor()

for tbl in ['units', 'machines', 'logsheets', 'logsheet_records', 'har_tickets', 'amc_reports']:
    cur.execute(f"SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name='{tbl}'")
    print(f"\n=== {tbl} ===")
    for c in cur.fetchall():
        print(f"  {c[0]}: {c[1]} ({c[2]})")

cur.execute("SELECT typname, enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid")
print("\n=== ENUMS ===")
enums = {}
for typ, lbl in cur.fetchall():
    enums.setdefault(typ, []).append(lbl)
for k, v in enums.items():
    print(f"  {k}: {v}")

conn.close()
