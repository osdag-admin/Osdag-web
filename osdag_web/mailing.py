import smtplib
import getpass

# import variables from utils.py 
from osdag_web import utils

def send_mail(email , OTP=123) : 
    print('inside send email')
    # OTP = 123 by default
    HOST = utils.HOST
    PORT = utils.PORT
    print('host : ' ,HOST)
    print('PORT ; ' ,PORT)

    FROM_EMAIL = utils.FROM_EMAIL
    TO_EMAIL = str(email)
    PASSWORD = utils.PASSWORD
    print('TO email :  ', TO_EMAIL)
    print('password : ' , PASSWORD)
    print('FROMT_EMAIL : ' ,FROM_EMAIL)
    MESSAGE = f"""Subject: OTP for Email verification

    Hi,
    
    Your OTP for Email verification for Osdag on Cloud application is : {OTP}

    Thanks,
    Osdag on Cloud Developer"""
    print('MESSAGE : ' , MESSAGE)
    print('sending...')
    smtp = smtplib.SMTP(HOST , PORT)

    status_code, response = smtp.ehlo()
    print(f"[*] Echoing the server : {status_code} {response}")

    status_code, response = smtp.starttls()
    print(f"[*] Starting the TLS : {status_code} {response}")

    status_code, response = smtp.login(FROM_EMAIL , PASSWORD)
    print(f"[*] Logging in : {status_code} {response}")

    try : 
        smtp.sendmail(FROM_EMAIL , TO_EMAIL , MESSAGE)
        print('sent...')
    except Exception as e : 
        print('An exception has occured while sending the mail :  ' , e)
    smtp.quit()
