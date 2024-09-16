export const listenForDatabaseChanges = () => {
    const eventSource = new EventSource('http://localhost:5000/events');

    return eventSource;
};
