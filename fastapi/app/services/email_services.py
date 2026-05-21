"""
Email сервисі — Gmail SMTP арқылы
"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_reset_email(to_email: str, token: str, user_name: str = ""):
    """
    Пароль қалпына келтіру email жіберу.
    Gmail App Password арқылы жұмыс істейді.
    """
    smtp_user = os.getenv("MAIL_USERNAME", "")
    smtp_pass = os.getenv("MAIL_PASSWORD", "")
    smtp_from = os.getenv("MAIL_FROM", smtp_user)

    if not smtp_user or not smtp_pass:
        print("⚠️  MAIL_USERNAME немесе MAIL_PASSWORD орнатылмаған!")
        return False

    # HTML email
    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f0fafb;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(78,205,196,0.15);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4ECDC4,#44b8b0);padding:32px 32px 24px;text-align:center;">
      <h1 style="margin:0;color:white;font-size:24px;font-weight:800;">🧴 Dermiq</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Skin Intelligence</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <h2 style="margin:0 0 12px;color:#2d3748;font-size:20px;font-weight:800;">
        Парольді қалпына келтіру
      </h2>
      {f'<p style="margin:0 0 16px;color:#718096;font-size:14px;">Сәлем, <strong>{user_name}</strong>!</p>' if user_name else ''}
      <p style="margin:0 0 20px;color:#718096;font-size:14px;line-height:1.6;">
        Сіз пароль қалпына келтіруді сұрадыңыз. Төмендегі кодты <strong>Dermiq</strong> қосымшасына енгізіңіз:
      </p>

      <!-- Token box -->
      <div style="background:#f0fafb;border:2px solid #4ECDC4;border-radius:14px;padding:20px;text-align:center;margin:0 0 20px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4ECDC4;">Reset Token</p>
        <p style="margin:0;font-size:13px;font-family:monospace;color:#2d3748;word-break:break-all;font-weight:600;background:white;padding:10px 14px;border-radius:8px;border:1px solid #e8f4f3;">{token}</p>
      </div>

      <div style="background:#fff8f0;border-left:4px solid #FFB347;border-radius:0 12px 12px 0;padding:14px 16px;margin:0 0 20px;">
        <p style="margin:0;font-size:13px;color:#8B6914;">
          ⏰ Бұл токен <strong>1 сағат</strong> ішінде жарамды.
        </p>
      </div>

      <p style="margin:0;font-size:12px;color:#a0aec0;line-height:1.6;">
        Егер сіз бұл сұрауды жасамаған болсаңыз, бұл хатты елемеңіз.
        Сіздің аккаунтыңыз қауіпсіз.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fdfc;padding:16px 32px;border-top:1px solid #e8f4f3;text-align:center;">
      <p style="margin:0;font-size:11px;color:#b0bec5;letter-spacing:0.05em;">
        © 2026 Dermiq · Skin Intelligence Platform
      </p>
    </div>
  </div>
</body>
</html>
"""

    # Plain text fallback
    plain_body = f"""
Dermiq — Парольді қалпына келтіру

Сіздің reset токеніңіз:
{token}

Бұл токен 1 сағат ішінде жарамды.

Егер сіз бұл сұрауды жасамаған болсаңыз, бұл хатты елемеңіз.
"""

    # Message жасау
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "🧴 Dermiq — Парольді қалпына келтіру"
    msg["From"] = f"Dermiq <{smtp_from}>"
    msg["To"] = to_email

    msg.attach(MIMEText(plain_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    # Gmail SMTP арқылы жіберу
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_from, to_email, msg.as_string())
        print(f"✅ Email жіберілді: {to_email}")
        return True
    except smtplib.SMTPAuthenticationError:
        print("❌ Gmail аутентификация қатесі — App Password дұрыс емес!")
        print("   Gmail → Security → App passwords → жаңа пароль жасаңыз")
        return False
    except Exception as e:
        print(f"❌ Email жіберу қатесі: {e}")
        return False