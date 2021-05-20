import { Server, Socket } from 'socket.io';
import config from 'config';

const port = config.get('port') as number;

export function start() {

    console.log(`Starting socket server on port ${port}`)
    const io = new Server(port);


    io.on('connection', (socket: Socket) => {
        console.log("New device attached.");
        socket.on('ping', () => {
            socket.emit('pong');
        })
    });

    setInterval(() => {
        io.emit('state', { state: 1, ok: true });
    }, 1000);
}