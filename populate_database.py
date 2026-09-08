import os
import psycopg2

#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################

try:
    # 1. Fetch credentials from environment or default to local development settings
    db_name = os.getenv('DATABASE_NAME', 'postgres_Intg_osdag')
    db_host = os.getenv('DATABASE_HOST', 'localhost')
    db_user = os.getenv('DATABASE_USER', 'osdagdeveloper')
    db_password = os.getenv('DATABASE_PASSWORD', 'password')
    db_port = os.getenv('DATABASE_PORT', '5432')

    conn = psycopg2.connect(
        database=db_name,
        host=db_host,
        user=db_user,
        password=db_password,
        port=db_port
    )
    cursor = conn.cursor()

    # 2. Check if the "Bolt" table exists and has rows
    cursor.execute("SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Bolt');")
    table_exists = cursor.fetchone()[0]

    has_data = False
    if table_exists:
        cursor.execute('SELECT count(*) FROM public."Bolt";')
        has_data = cursor.fetchone()[0] > 0

    if not has_data:
        print('Database is empty. Starting population...')
        with open("osdag_core/data/ResourceFiles/Database/postgres_Intg_osdag.sql", "r") as file:
            data = file.read()
        cursor.execute(data)
        conn.commit()
        print('SUCCESS : Database Populated')
    else:
        print('Database already populated. Skipping population.')

except Exception as e:
    print('Database population error:', e)
