import psycopg2
from psycopg2 import sql

#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################


conn = psycopg2.connect(database='postgres', host='localhost',
                        user='postgres', password='Vinay@404', port='5432')
cursor = conn.cursor()
file = open("ResourceFiles/Database/postgres_Intg_osdag.sql", "r+")

data = file.read()

cursor.execute(data)
print('SUCCESS : Database Populated')
