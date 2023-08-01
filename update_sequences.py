import psycopg2
from psycopg2 import sql

#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################


conn = psycopg2.connect(database='postgres_Intg_osdag', host='127.0.0.1',
                        user='osdagdeveloper', password='password', port='5432')
cursor = conn.cursor()
file = open("ResourceFiles/Database/update_sequences.sql", "r+")

data = file.read()

cursor.execute(data)
print('SUCCESS : Sequences Updated')
