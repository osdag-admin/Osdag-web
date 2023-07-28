import smtplib
import getpass

# import variables from utils.py 
from osdag_web.utils import HOST, PORT, FROM_EMAIL, PASSWORD

def send_mail(OTP = 123) : 
    # OTP = 123 by default
    HOST = HOST
    PORT = PORT

    FROM_EMAIL = FROM_EMAIL
    TO_EMAIL = "atharva0300@gmail.com"
    PASSWORD = PASSWORD
    MESSAGE = f"""Subject: OTP for Email verification

    Hi Atharva,
    
    Your OTP for Email verification for Osdag on Cloud application is : {OTP}

    Thanks,
    Osdag on Cloud Developer"""
    smtp = smtplib.SMTP(HOST , PORT)

    status_code, response = smtp.ehlo()
    print(f"[*] Echoing the server : {status_code} {response}")

    status_code, response = smtp.starttls()
    print(f"[*] Starting the TLS : {status_code} {response}")

    status_code, response = smtp.login(FROM_EMAIL , PASSWORD)
    print(f"[*] Logging in : {status_code} {response}")

    smtp.sendmail(FROM_EMAIL , TO_EMAIL , MESSAGE)
    smtp.quit()