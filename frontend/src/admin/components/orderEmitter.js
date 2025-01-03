export const listenForDatabaseChanges = () => {
    const eventSource = new EventSource(`${process.env.REACT_APP_SERVER_LINK}/api/events');

    return eventSource;
};
