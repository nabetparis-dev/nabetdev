IMPORTANT EMAIL

Les emails ne peuvent pas partir sans SMTP configuré.
Va dans Admin > APIs / Grow / Email, puis remplis:

email.smtpHost
email.smtpPort
email.smtpUser
email.smtpPass
email.fromEmail
email.adminEmail = rehouv.pro@gmail.com

Exemple Gmail:
smtpHost = smtp.gmail.com
smtpPort = 465
smtpUser = ton adresse Gmail
smtpPass = mot de passe d'application Gmail, pas le mot de passe normal
fromEmail = ton adresse Gmail
adminEmail = rehouv.pro@gmail.com

Sans SMTP, le site sauvegarde les emails dans data/emailLogs.json mais ne peut pas les envoyer réellement.
