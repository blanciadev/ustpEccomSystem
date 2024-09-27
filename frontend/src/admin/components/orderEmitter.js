export const listenForDatabaseChanges = () => {
    const eventSource = new EventSource('http://localhost:5001/events');

    return eventSource;
};
