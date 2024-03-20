import React, {FunctionComponent, useState} from "react";
import {
    getContainedResourceUrlAll,
    getFile,
    acp_ess_2
} from "@inrupt/solid-client";
import {fetch} from "@inrupt/solid-client-authn-browser";

export const PodComponent: FunctionComponent = () => {
    const [urls, setUrls] = useState<string[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [fileContent, setFileContent] = useState<string>('');
    const [originalContent, setOriginalContent] = useState<string>('');
    const [fileUrl, setFileUrl] = useState<string>(''); // Store the URL of the file being edited
    const [newFileName, setNewFileName] = useState<string>('');
    const [newFileContent, setNewFileContent] = useState<string>('');

    const myUrl: string = "https://solidcommunity.net/Example-Pod/";     // ***MUST BE CHANGED TO USERS POD***

    // Fetches top-level of Pod
    const fetchPod = async () => {
        try {
            if (typeof myUrl === "string") {
                const rootDataset = await acp_ess_2.getSolidDatasetWithAcr(myUrl, {fetch: fetch});
                const containedUrls = getContainedResourceUrlAll(rootDataset);
                setUrls(containedUrls);
            }
        } catch (error) {
            console.error("Error fetching Pod:", error);
            alert("Error fetching Pod - access denied");
        }
    };

    // Checks if file is a resource not a container
    const hasFileExtension = (url: string): boolean => {
        const pathSegments = url.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1];
        return lastSegment.includes('.');
    };

    // If file is a resource, user can read. Otherwise, it is a container and repeats fetching of the Pod
    const handleUrlClick = async (url: string) => {
        try {
            if (typeof url === "string") {
                const hasFileExtensionCheck = hasFileExtension(url);
                if (hasFileExtensionCheck) {
                    console.log("Contained URLs with file extensions found.");
                    // Your logic for handling URLs with file extensions goes here
                    await readFile(url);
                } else {
                    console.log("No contained URLs with file extensions found.");
                    // Your logic for handling URLs without file extensions goes here
                    console.log(url);
                    const rootDataset = await acp_ess_2.getSolidDatasetWithAcr(url, {fetch: fetch});
                    const containedUrls = getContainedResourceUrlAll(rootDataset);
                    setUrls(containedUrls);
                }
                 return url;
                }
            }catch (error) {
            console.error("Error fetching Pod:", error);
            alert("Error fetching Pod - access denied");
        }
    };

    // Allows user to read the contents of resource
    const readFile = async (url: string) => {
        const response = await getFile(url, {fetch: fetch});
        const readFileReturn = await response.text();
        setFileContent(readFileReturn);
        setOriginalContent(readFileReturn);
        setFileUrl(url); // Update file URL
    };

    // Tracks if file content is updated
    const handleFileContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFileContent(event.target.value);
    };

    // Saves any updates made by user to the resource
    const handleSaveChangesClick = async (url:string) => {
        try {
            // Send modified content back to the server
            const response = await fetch(url, {
                method: 'PUT', // or 'POST' if appropriate
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: fileContent,
            });
            if (!response.ok) {
                throw new Error(`Failed to save changes: ${response.status} ${response.statusText}`);
            }
            alert('Changes saved successfully!');
            setOriginalContent(fileContent); // Update original content after saving
        } catch (error) {
            console.error("Error saving changes:", error);
            alert("Error saving changes");
        }
    };

    // Shows the "Set up Security Policy" inputs
    const handleSubmit = async (event: React.FormEvent<HTMLButtonElement>) => {
        setShowForm(true);
    };

    // Stores URL for resource user wishes ACP policy to be set
    const handleFileName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewFileName(event.target.value);
    };

    // Stores file content entered for ACP policy
    const handleNewFileContent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewFileContent(event.target.value);
    };

    // Writes ACP policy to the .acr file for resource
    const handleSetPolicyClick = async (url: string) => {
        try {
            if (!newFileName || !newFileContent) {
                alert("File name and content are required");
                return;
            }

            const apiUrl = newFileName;

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'text/turtle',
                },
                body: newFileContent,
            });

            if (!response.ok) {
                throw new Error(`Failed to create file: ${response.status} ${response.statusText}`);
                alert("Failed to create file");
            }
            alert('File created successfully!');
            // Optionally, clear input fields after successful creation
            setNewFileName('');
            setFileContent('');
        } catch (error) {
            console.error("Error creating file:", error);
            alert("Error creating");
        }
    };

    interface Props {
        show: boolean;
    }

    // Controls the show/hide of the Set Up Security Policy section of UI
    const SetPolicy = (props: Props) => {
        if (props.show) {
            return (
                <div>
                    <h1>Create File</h1>
                    <label>
                        File Name:
                        <input type="text" value={newFileName} onChange={handleFileName} />
                    </label>
                    <br/>
                    <br/>
                    <label>
                        File Content:
                    </label>
                    <br/>
                        <textarea value={newFileContent} onChange={handleNewFileContent} rows={20} cols={50} />
                    <button onClick={() => handleSetPolicyClick(fileUrl)}>
                        Set policy
                    </button>
                </div>

            )
        }else{
            return(
            <div><p></p></div>      // Until button is clicked nothing is shown
            )
        }
    }

        return (
        <div>
            <button onClick={fetchPod}>Fetch Pod Resources</button>
            <ul>
                {urls.map((url, index) => (
                    <li key={index} onClick={() => handleUrlClick(url)} style={{ cursor: 'pointer' }}>
                        {url}
                    </li>
                ))}
            </ul>
            <button onClick={handleSubmit}>Set a Security Policy</button>
            <SetPolicy show={showForm}></SetPolicy>
            <div>
            <h2>File Content:</h2>
            <textarea
                value={fileContent}
                onChange={handleFileContentChange}
                rows={10}
                cols={50}
                style={{resize: 'vertical'}} // Optional: Enable vertical resizing
            />
                <button onClick={() => handleSaveChangesClick(fileUrl)}> {/* Pass the file URL */}
                    Save Changes
                </button>
        </div>
        </div>
    );
};
