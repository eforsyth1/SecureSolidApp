# Secure Solid App

The proposed solution is the development of a “Secure Solid App”. This app would function as a pivotal layer situated hierarchically above any Pod access apps, such as Penny. The security app aims to provide a user-friendly method to set and modify robust Access Control Policies (ACPs). Acting as a centralised control hub, the app operates within the Pod environment requiring only acl:Control access to the Pod, as defined by the Web Access Control (WAC) protocol, granting “access to a class of read and write operations” for an Access Control Resource (ACR).

Throughout this study the inclusion of acp:client and acp:issuer predicates in the ACP configuration is important for enhancing security. These predicates, while not present in default ACP configurations, play a key role in mitigating unintended information flows and preventing compromised apps or Identity Providers (IdPs) from maliciously accessing a user's Pod.

# Experiment 

The experiment was intended to reproduce the Clark-Wilson Model where a Pod owner can restrict access to one resource, Resource1, via an app, app1, and a second resource, Resource2, via a second app, app2. Furthermore, grant limited Pod access to another agent, external agent, to access Resource2 using app2.

![image](https://github.com/eforsyth1/SecureSolidApp/assets/164050959/bad29d43-d29d-4290-a761-e308ab3c121c)

The apps utilised were Penny (https://penny.vincenttunru.com/) and SolidFileManager (https://otto-aa.github.io/solid-filemanager/), representing app1 and app2 respectively, to assess whether the implementation of the acp:client predicate truly mitigated unintended information flows. However, this study revealed that acp:client requires a client ID to refer to but no Solid access app currently offers this feature. Consequently, a JSON-LD was generated to compensate and coded into the apps so the acp:client client ID is: 

- Penny: https://solidweb.me/ClientPod/public/clientid.jsonld
- SolidFileManager: https://solidweb.me/ClientPod/public1/clientid.jsonld

Moreover, the exclusion of the acp:client predicate produces an attack vector where unintended information flows arise and compromised apps can access all resources within a Pod. However, users are currently required to set an ACP policy on server-side code which for many users lacking technical expertise may not be possible. Therefore, the Secure Solid App was produced to compensate by providing an easy to use interface where users can set their ACP policy and specifically acp:client. 

The security app had a policy set for the Pod where acl:Control only access was given and acp:client (https://solidweb.me/ClientPod/demoApp/clientid.jsonld) was specified. Therefore, if no default ACP policy is set for Resource1 or Resource2, no app can access it. Subsequently, a default ACP policy must be set for the given resources where no acp:client is set to demonstrate that the inclusion of acp:client is imperative. This can be achieved using Secure Solid App.

## Results 

The security app produced the desired results where a user can log into their Solid Pod using their IdP and set their ACP policy for a given resource. If the user has an existing ACP policy for a resource this is overwritten with the new ACP policy saved. However, if there is no ACP policy for a resource an existing blank .acr file must exist**.

Firstly, access was tested when acp:client was omitted. As expected Resource1 was accessible by app2 and, similarly Resource2 via app1. Subsequently producing an unintended information. After the acp:client was set, Resource1 could only be accessed via app1 and likewise Resource2 access only by app2.

Therefore, the Clark-Wilson model results were producible and access was restricted to Resource1 via Penny and Resource2 via SolidFileManager through the setting of a new ACP policy including acp:client using the security app.

## Reproducing Experimental Results

The following is based upon the set using IntelliJ, however could simply be ran using command line.
**Setting Up the Apps**
1. Download Penny ([branch Penny](https://gitlab.com/vincenttunru/penny)).
   * Users must create a new file **.env.local** in the root folder containing the following line: **NEXT_PUBLIC_CLIENT_ID="https://solidweb.me/ClientPod/public/clientid.jsonld"**
   * Users must add their Identity Provider (IdP) e.g. https://solidweb.me to the list of IdPs at line 38 within **src/functions/connect.ts**
2. Download SolidFileManager ([branch SolidFileManager](https://github.com/Otto-AA/solid-filemanager)).
   * Users must add this line **clientId: "https://solidweb.me/ClientPod/public1/clientid.jsonld",** into the login function below line 25 of Actions.ts. The file Action.ts can be found in the folder **src/Actions**.
3. Ensure **npm** and **react-scripts** are installed by simply running the command **npm install** and **npm install react-scripts** respectively.    
4. Run the apps by entering **npx next dev -p 5000** and **npm run start**, for Penny and SolidFileManager respectively. The SolidFileManager must be ran before the security app due to localhost ports.
5. Create two different resources within the Pod to test and represent Resource1 and Resource2 within the Clark-Wilson model.
6. If an existing ACP policy exists for a resource this is fine, if not a blank .acr file must exist for the resource.

**Setting Up the Secure Solid App**
1. Download the repository on this branch (main) - the client ID is within the files already.
2. The Pod intended to be retrieved must be manually added to the file. Please enter the WebID in **src/acpControl.tsx** on line 18, e.g. https://solidweb.me/Example/ ***
3. Run the app by entering **npm run start** (the security app should not run on the same port as SolidFileManager)

**Pod ACP Policy**
To ensure the intended results are produced users must set an ACP similar to the below in the root of their Pod:

![image](https://github.com/eforsyth1/SecureSolidApp/assets/164050959/73698628-4c86-4126-a05e-6e362815e183)

@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix acp: <http://www.w3.org/ns/solid/acp#>.

<#root>
    a acp:AccessControlResource;
    # Set the access to the root storage folder itself
    acp:resource <./>;
    # The homepage is readable by the public
    acp:accessControl <#publicReadAccess>, <#secureApp>;
    acp:memberAccessControl <#secureApp>.

<#publicReadAccess>
    a acp:AccessControl;
    acp:apply [
        a acp:Policy;
        acp:allow acl:Read;
        acp:anyOf [
            a acp:Matcher;
            acp:agent acp:PublicAgent
        ]
    ].

<#secureApp>
    a acp:AccessControl;
    acp:apply [
        a acp:Policy;
        acp:allow acl:Control;
        acp:allOf [
            a acp:Matcher;
            acp:client <https://solidweb.me/ClientPod/demoApp/clientid.jsonld>;
            acp:agent <https://localhost:3000/Example/profile/card#me>;
            acp:issuer <https://localhost:3000/>
        ]
    ].


# Clark-Wilson and the Security App

Users may have an existing policy set up for a resource but if not refer to **Setting Up Resources**
**Setting Up Resources**
1. Create a new Resource or Container
   * This can be done by simply logging into Penny (https://penny.vincenttunru.com/) using your IdP.
   * After accessing your Pod, click **Add Resource**. For a resource enter e.g. Resource1 and for a container enter e.g. Resource1/
2. Add text if it is a resource enter data to and if it is a container add a resource within before adding data to the file.
   * This can be done by following Step 1 again.
3. Repeat for Resource2
4. Add an ACR (.acr) file to the resource or container.
   * If using IntelliJ for a self-hosted Pod, simple add a file and name it Resource1.txt.acr or .acr for a resource or container, respectively.
   * An existing, blank ACR has to be created for the Security App to work.
   
**Using the Secure Solid App to set an ACP policy (ensuring acp:client is omitted)**
1. Login into the security app using your IdP
2. Clicking "Fetch Pod Resources" button will return the top-level of containers to a user (providing public read access has been granted within root Access Control Resource (ACR))
3. Users must set a default ACP policy which omits acp:client by clicking the Set a Security Policy button.
4. Within the filename, users must enter the full URL of resource or container they wish to set the policy for and append .acr - e.g. https://solidcommunity.net/Example-Pod/Resource1/.acr for a container.
5. Within the file context, users must enter a complete ACP policy such as the default ACP policy listed in Figure 2. 
6. Press save changes
7. Repeat for Resource2
   * Use Figure 3 as a default ACP policy for Resource2

**Testing the Clark-Wilson Model Omitting acp:client**
1. Attempt to access Resource1 with Penny (the intended app, **http://localhost:5000**) - this should be possible.
2. Attempt to access Resource1 with SolidFileManager - this should not be possible but access will be granted.
3. Attempt to access Resource2 with Penny - this should not be possible but access will be granted.
4. Attempt to access Resource2 with SolidFileManager (the intended app, **http://localhost:3001**) - this should be possible.

**Using the Secure Solid App to set an ACP policy including acp:client**
1. Once again, login into the security app using your IdP if you have not already done so
2. Clicking "Fetch Pod Resources" button will return the top-level of containers to a user (providing public read access has been granted)
3. Users must set a default ACP policy which includes acp:client for Resource1 by clicking the Set a Security Policy button.
   a. Within the filename, users must enter the full URL of resource or container they wish to set the policy for and append .acr - e.g. https://solidcommunity.net/Example-Pod/Resource1/.acr
   b. Within the file context, users must adapt Figure 2 default ACP policy ensuring the inclusion of acp:client has been included for Resource1 via app1 using the clientID provided for Penny by entering **acp:client <https://solidweb.me/ClientPod/public/clientid.jsonld>;** above **acp:agent**.
   c. Press save changes
4.  Users must set a adapt Figure 3's default ACP policy to include acp:client for Resource2.
   a. Within the filename, users must enter the full URL of resource or container they wish to set the policy for and append .acr - e.g. https://solidcommunity.net/Example-Pod/Resource2/.acr
   b. Within the file context, users must enter a complete ACP policy ensuring the inclusion of acp:client has been included for Resource2 via app2 using the clientID provided for SolidFileManager by entering **acp:client <https://solidweb.me/ClientPod/public1/clientid.jsonld>;** above **acp:agent** for both the Pod Owner and additional agent (if you wish access to be permitted)
   c. Press save changes

**Testing the Clark-Wilson Model Including acp:client**
1. Attempt to access Resource1 with Penny (the intended app, **http://localhost:5000**) - this will be possible.
2. Attempt to access Resource1 with SolidFileManager - this will now not be possible.
3. Attempt to access Resource2 with Penny - this will now not be possible.
4. Attempt to access Resource2 with SolidFileManager (the intended app, **http://localhost:3001**) - this will be possible.

# Conclusions

The inclusion of acp:client is imperative to include within an ACP policy, not only to demonstrate a security model such as Clark-Wilson, but to mitigate unintended information flows. Access to resources should only be granted by the apps specified by a user to ensure robust security measures are in place and attack vectors cannot be reproduced.

## Notes
The login process and basic functionality within this app has been adapted, as LDO was not required, from the following tutorial: https://github.com/jaxoncreed/ldo-react-tutorial-1. However, the core functionally of setting an ACP policy has been implemented by myself.

** Due to an access forbidden error when creating an .acr file, users must manually implement a blank .acr file.

*** Due to issues in development, the Pod intended to be retrieved must be manually added to the file as the WebID could not be carried over from Login page. 
