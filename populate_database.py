import psycopg2 
from psycopg2 import sql

"""
database = 'postgres'
host = '127.0.0.1'
user = 'osdaguser'
password = 'password' 
port = '5432'
"""


conn = psycopg2.connect(database = 'osdagDatabase' , host = '127.0.0.1' , user = 'osdagdeveloper' , password = 'password' , port = '5432')
cursor = conn.cursor()
file = open("ResourceFiles/Database/clean_Intg_osdag.sql" , "r+")
print('file contents : ')

data = file.read()

cursor.execute(data)
print()
print('executed')