# Self-hosting with Docker image

This guide provides instructions for self-hosting the Mollie commercetools connector.

To get started, you need to have a Docker image for the connector.

## Docker Image

This Dockerfile is designed to create a Docker image for a Node.js application using a multi-stage build process. It separates the build environment from the runtime environment to optimize the final image size.

**File path:** [Dockerfile](https://github.com/mollie/commercetools-connector/blob/main/processor/Dockerfile)

### Prerequisites

- Docker installed on your machine.
- Basic knowledge of Docker commands.

### Building the Docker Image

To build the Docker image, navigate to the [directory](https://github.com/mollie/commercetools-connector/tree/main/processor) containing the Dockerfile and run the following command:

```bash
docker build -t your-image-name .
```

Replace `your-image-name` with a name of your choice for the Docker image.

### Running the Docker Container

After building the image, you can run the container using the following command:

```bash
docker run -e CTP_CLIENT_ID="CTP_CLIENT_ID" -e CTP_CLIENT_SECRET="CTP_CLIENT_SECRET" -p 8080:8080 your-image-name
```

Please refer to [.env.example](https://github.com/mollie/commercetools-connector/blob/main/processor/.env.example) for full list of required environment variables 

This command maps port 8080 of the container to port 8080 on your host machine.

### Accessing the Application

Once the container is running, you can access the application by navigating to `http://localhost:8080` in your web browser.

### Stopping the Container

To stop the running container, you can use the following commands:

```bash
docker ps # Find the container ID
docker stop <container_id>
```

Replace `<container_id>` with the actual ID of the running container.

### Notes

- Ensure that your application is configured to listen on the correct port (8080).
- The image is built with production dependencies only, ensuring a smaller footprint.

## Setup Scripts

By using the API setup endpoint below, the connector URL will be the original URL of Express to install necessary configurations and extensions on commercetools.

### Install Connector Configurations

**Endpoint:** `POST {connectorUrl}/processor/install`  
**Response:**

- On success: Returns a success message with a status code of 200.
- On failure: Returns an error message with a status code of 400 or other relevant error codes.

### Uninstall Connector Configurations

**Endpoint:** `POST {connectorUrl}/processor/uninstall`  
**Response:**

- On success: Returns a success message with a status code of 200.
- On failure: Returns an error message with relevant error codes.
