import axios from 'axios';

export const handleApiError = (error: any): string => {
    if (axios.isCancel(error)) {
        return ''; // Silent failure for cancellations
    }

    if (error.response) {
        const status = error.response.status;
        const serverMsg = error.response.data?.error;

        // If backend provided a specific message, prefer that (unless it's generic)
        if (serverMsg && serverMsg.length < 100) {
            // efficient fallback check could go here
        }

        switch (status) {
            case 400:
                return serverMsg || "Bad Request: Please check your input file.";
            case 401:
                return "Unauthorized: Please checking your OpenAI API Key in Settings.";
            case 403:
                return "Forbidden: You don't have permission to access this resource.";
            case 404:
                return "Not Found: The requested resource could not be found.";
            case 405:
                return "Method Not Allowed: Invalid request method.";
            case 409:
                return "Conflict: The request conflicts with current state.";
            case 429:
                return "Too Many Requests: You are being rate-limited by OpenAI. Please wait a moment.";
            case 500:
                return "Server Error: Something went wrong on the backend. Please check server logs.";
            case 502:
                return "Bad Gateway: The server received an invalid response from an upstream server (OpenAI).";
            case 503:
                return "Service Unavailable: The server is temporarily overloaded or down.";
            case 504:
                return "Gateway Timeout: The upstream server (OpenAI) took too long to respond.";
            default:
                return serverMsg || `An error occurred (${status}). Please try again.`;
        }
    } else if (error.request) {
        // Request made but no response received
        return "Network Error: No response received. Please check your internet connection.";
    } else {
        // Something happened setting up the request
        return error.message || "An unexpected error occurred.";
    }
};
