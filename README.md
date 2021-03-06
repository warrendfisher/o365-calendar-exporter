# o365-calendar-exporter

Office365 Calendar Exporter to Excel

## How to use

Here we document how to configure your Office365 account to allow OData access.

---

### .ENV

Create a '.env' file in the project root.

  NOTE: This has been consciously excluded in my .gitignore file so that your Office365 Graph API parameters, as below, are not shared with all and sundry.:

    APP_ID
    APP_PASSWORD
    APP_SCOPES
    REDIRECT_URI

Your '.env' file should have the following structure and should be populated with the information from your Office 365 'config' page.

```.env
APP_ID=<app_id_uuid>
APP_PASSWORD=<some_app_password>
APP_SCOPES=<string of authorised scopes for the app id>   eg. 'openid email profile offline_access User.Read Calendars.Read'
REDIRECT_URI=http://localhost:3000/authorize
```

---

### Office365 App API Config

In order to generate and authorise your API access to Office365 use the following link:

> To be documented and confirmed
Follow this link:
 [Use the Microsoft Graph API] (https://docs.microsoft.com/en-us/graph/use-the-api)

 - First register

 [Register your app with the Azure AD v2.0 endpoint] (https://docs.microsoft.com/en-us/graph/auth-register-app-v2)
 Sign in with your Office 365 account and follow the wizard to register your app.

 - 

### Run the application

To start the nodejs app...
open command prompt to the project root path
run
  npm start