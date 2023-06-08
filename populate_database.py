import psycopg2 
from psycopg2 import sql


conn = psycopg2.connect(database = 'postgres_Intg_osdag' , host = '127.0.0.1' , user = 'osdagdeveloper' , password = 'password' , port = '5432')
cursor = conn.cursor()
file = open("ResourceFiles/Database/postgres_Intg_osdag.sql" , "r+")
print('file contents : ')

data = file.read()

cursor.execute(data)
print()
print('executed')