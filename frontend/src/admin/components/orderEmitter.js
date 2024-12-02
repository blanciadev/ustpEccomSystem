export const listenForDatabaseChanges = () => {
    const eventSource = new EventSource('http://localhost:5001/api/events');

    return eventSource;
};
