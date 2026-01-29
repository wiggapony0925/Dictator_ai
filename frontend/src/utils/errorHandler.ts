import axios from 'axios';

export const handleApiError = (error: any): string => {
    if (axios.isCancel(error)) {
        return ''; // Silent failure for cancellations
    }

    if (error.response) {
        const status = error.response.status;
        const serverMsg = error.response.data?.error;

        // If backend provided a specific message, always prioritize it
        if (serverMsg) {
            return serverMsg;
        }

        switch (status) {
            case 400:
                return "Bad Request: The file could not be analyzed. Please ensure it is a valid PDF.";
            case 401:
                return "Invalid API Key: Access denied. Please enter a valid OpenAI API Key in Settings.";
            case 429:
                return "Too Many Requests: You are being rate-limited by OpenAI. Please try again in a minute.";
            case 500:
                return "Server Error: The backend encountered an issue. Please try a different file.";
            case 502:
            case 503:
            case 504:
                return "Connection Error: Unable to reach OpenAI services. Please check your internet or API status.";
            default:
                return `An error occurred (${status}). Please try again.`;
        }
    } else if (error.request) {
        // Request made but no response received
        return "Network Error: No response received. Please check your internet connection.";
    } else {
        // Something happened setting up the request
        return error.message || "An unexpected error occurred.";
    }
};
