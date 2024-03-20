# Secure Solid App

This app provides users with a user-friendly way of creating an ACP policy for their Pod. Currently, the app is a proof of concept prototype and requires further development before deployment. 

## Before Running Requirements

Due to issues in development, the Pod intended to be retrieved must be manually added to the file. Please enter the WebID in src/acpControl.tsx on line 18.

## Running the App

To run: **npm run start**

## How to use:

To set an security policy:
- Ensure acl:Control is set
- Enter the full URL you wish to set ACP policy for e.g. https://solidweb.me/Example/Resource/.acr
- Enter the ACP policy within the file context

