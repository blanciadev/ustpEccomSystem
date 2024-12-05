export const listenForDatabaseChanges = () => {
    const eventSource = new EventSource('https://ustp-eccom-server.vercel.app/api/events');

    return eventSource;
};
