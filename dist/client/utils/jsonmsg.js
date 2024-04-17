export function sendMsg(socket, type, body) {
    const jsonMsg = {
        type: type,
        body: body
    };
    socket.send(JSON.stringify(jsonMsg));
}
