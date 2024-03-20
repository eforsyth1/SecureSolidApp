import { login, ISessionInfo } from "@inrupt/solid-client-authn-browser";
import React, { FunctionComponent, useCallback } from "react";

//Login page

const LoginHeader: FunctionComponent<{
    sessionInfo?: ISessionInfo
}> = ({ sessionInfo }) => {
    const loginCallback = useCallback(() => {
        const oidcIssuer = prompt(                          // Users are promoted to enter issuer to authenticate
            "Enter your Solid OIDC Issuer (Example: https://solidcommunity.net)",
            "https://solidcommunity.net"
        );
        if (oidcIssuer) {                           // If issuer exists...
            login({
                oidcIssuer,
                redirectUrl: window.location.href,
                clientName: "Secure Solid App",
                clientId: "https://teamid.live/ClientPod/demoApp/clientid.jsonld"   // Client ID generated to use with acp:client
            });
        } else {
            alert("Please provide an issuer.");
        }
    }, []);

    if (sessionInfo?.isLoggedIn) {
        return (
            <p>Logged in as {sessionInfo.webId}</p>
        )
    } else {
        return (
            <button onClick={loginCallback}>Log into a Solid Pod</button>
        )
    }
}

export default LoginHeader;

