import { useState } from 'react';

export const useSearch = ({ onDataReceived }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearchClick = async (logs, context) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://127.0.0.1:5000/analyse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "logs": logs,
                    "context": context
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to upload data');
            }

            const data = await response.json();
            onDataReceived(data.logs);
        } catch (error) {
            setError('Error uploading data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        handleSearchClick
    };
};

export default useSearch;