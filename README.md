# n8n-nodes-tavilyapi

**n8n-nodes-tavilyapi** is an n8n community node package that integrates the [Tavily API](https://api.tavily.com) for powerful **web search** and **content extraction**.

It contains two nodes:

1.  **Tavily Search**: Query the web using Tavily’s `/search` endpoint.
2.  **Tavily Extract**: Extract structured content from URLs using Tavily’s `/extract` endpoint.

---

## Table of Contents

1.  [Features](#features)
2.  [Installation](#installation)
3.  [Getting a Tavily API Key](#getting-a-tavily-api-key)
4.  [Configuring Credentials in n8n](#configuring-credentials-in-n8n)
5.  [Usage](#usage)
    * [Example: Tavily Search Node](#example-tavily-search-node)
    * [Example: Tavily Extract Node](#example-tavily-extract-node)
6.  [Parameters](#parameters)
    * [Tavily Search Parameters](#tavily-search-parameters)
    * [Tavily Extract Parameters](#tavily-extract-parameters)
7.  [Troubleshooting](#troubleshooting)
8.  [License (MIT)](#license-mit)

---

## Features

-   **Tavily Search**
    * Query the web with multiple filtering options (topic, time range, domain inclusion/exclusion, etc.).
    * Optionally retrieve a generated answer, raw content, or images.

-   **Tavily Extract**
    * Extract text and optional images from one or more URLs.
    * Choose between basic or advanced extraction depth.

-   **Robust Error Handling**
    * Comprehensive input validation with descriptive error messages.
    * Catch Tavily API error codes (`400, 401, 403, 429, 500`) and display them in n8n.

-   **Easy Setup**
    * Install from npm.
    * Configure a single **Tavily API** credential in n8n.

---

## Installation

1.  From your n8n root directory, run:

    ```bash
    npm install n8n-nodes-tavilyapi
    ```

2.  Restart n8n.

---

## Getting a Tavily API Key

1.  Go to the [Tavily website](https://tavily.com) and create an account.
2.  Navigate to your dashboard or settings to find your API key.

---

## Configuring Credentials in n8n

1.  In your n8n instance, go to the "Credentials" section.
2.  Click "Create Credential".
3.  Search for or select "Tavily API".
4.  Enter your Tavily API key in the appropriate field.
5.  Save the credential.

---

## Usage

### Example: Tavily Search Node

1.  Add the "Tavily Search" node to your n8n workflow.
2.  Connect it to the preceding node in your workflow.
3.  In the node's settings:
    * Select your Tavily API credential.
    * Enter your search query.
    * Configure any other desired search parameters (topic, search depth, etc.).
4.  Run the workflow to execute the search.

### Example: Tavily Extract Node

1.  Add the "Tavily Extract" node to your n8n workflow.
2.  Connect it to the preceding node.
3.  In the node's settings:
    * Select your Tavily API credential.
    * Enter the URLs you want to extract content from.
    * Configure any other extraction parameters (include images, extract depth).
4.  Run the workflow to extract the content.

---

## Parameters

### Tavily Search Parameters

| Parameter              | Description                                                                                             |
| :--------------------- | :------------------------------------------------------------------------------------------------------ |
| **Query** | The search query to execute.                                                                            |
| **Topic** | The category of the search (General or News).                                                           |
| **Search Depth** | The depth of the search (Basic or Advanced).                                                             |
| **Max Results** | Maximum number of search results to return (0-20).                                                      |
| **Time Range** | Time range filter for results (relative to current date).                                               |
| **Days (News Only)** | Number of days back from the current date to include (for News topic).                                  |
| **Include Answer** | Include an LLM-generated answer in the response (No, Basic, or Advanced).                               |
| **Include Raw Content** | Include cleaned and parsed HTML content of each search result.                                         |
| **Include Images** | Perform an image search and include the results in the response.                                         |
| **Include Image Descriptions** | When including images, also add a descriptive text for each image.                               |
| **Include Domains** | A list of domains to specifically include in the search results.                                         |
| **Exclude Domains** | A list of domains to specifically exclude from the search results.                                      |

### Tavily Extract Parameters

| Parameter        | Description                                                                 |
| :--------------- | :-------------------------------------------------------------------------- |
| **URLs** | One or more URLs to extract content from.                                     |
| **Include Images** | Include a list of images extracted from each URL.                          |
| **Extract Depth** | How deeply to parse each URL (Basic or Advanced).                           |

---

## Troubleshooting

### Common Issues & Error Codes

* **Invalid API Key:** Ensure your Tavily API key is entered correctly in the credentials.
* **Rate Limiting (429):** You have exceeded your Tavily API rate limit. Wait a while before making more requests or upgrade your Tavily plan.
* **Bad Request (400):** Check your input parameters for errors or missing required fields.
* **Other Error Codes (401, 403, 500):** Refer to the Tavily API documentation for details on specific error codes.

---

## License (MIT)

MIT License

Copyright (c) 2025 LEVEL AI XYZ

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.