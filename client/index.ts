import os from 'os';
import io from 'socket.io-client';
import net from 'net';
import lodash from 'lodash';

export function start() {
    function connectToServer(server: string) {

        const socket = io(`ws://${server}:50000`);

        let connected = false;

        socket.on('pong', () => {
            connected = true;
        })

        socket.on('state', (...args: any[]) => {
            console.log(args);
        })

        async function wait(seconds: number) {
            return new Promise(res => {
                setTimeout(res, seconds * 1000);
            })
        }

        async function checkConnection() {
            if (!connected) {
                console.log('Trying to connect to server...')
            } else {
                console.log('Connection to server alive!');
            }
            connected = false;
            socket.emit('ping');
            await wait(3);

            checkConnection();
        }

        function startPoolingServerConnection() {
            checkConnection();
        }

        startPoolingServerConnection();
    }

    function getIpRange() {
        let networkInterfaces = os.networkInterfaces();
        let validItems: Array<os.NetworkInterfaceInfo> = [];
        for (let key in networkInterfaces) {
            let items = networkInterfaces[key];
            validItems = validItems.concat(items!.filter(item => item.family === 'IPv4' && !item.internal && key.startsWith('wl')));
        }

        if (validItems.length === 0) {
            throw new Error("No adapters where found.");
        } else if (validItems.length > 1) {
            throw new Error("More than one adapter found.");
        }
        else {
            return validItems[0].address
        }
    }

    async function testServer(ip: string, ttl: number) {
        return new Promise<string | void>((res) => {
            const client = new net.Socket();
            client.connect(50000, ip, () => {
                res(ip);
            });

            client.on('error', () => {
                client.destroy();
                res();
            })

            setTimeout(() => {
                client.destroy();
                res();
            }, ttl);

        });
    }

    async function findServer(): Promise<string> {
        const myIp = getIpRange();
        const matches = myIp.match(/^(\d+\.\d+.\d+)\.(\d+)$/);
        if (!matches) {
            throw new Error("Could not parse IP");
        }
        const [_, myIpSubmask, myIpId] = matches;

        const ipRange = [...Array(256).keys()].map(e => `${myIpSubmask}.${e}`)

        for (const ttl of [50, 100, 300, 500, 1000]) {
            console.log(`Trying to find servers using ttl ${ttl}...`);
            for (const ipChunk of lodash.chunk(ipRange, 5)) {
                console.log(`Trying to find server in chunk ${ipChunk}...`);
                const foundServers = (await Promise.all(ipChunk.map(ip => testServer(ip, ttl)))).filter(e => Boolean(e));
                if (foundServers.length >= 1) {
                    console.log(`Found server at ${foundServers[0]}!`);
                    return foundServers[0] as string;
                }
            }
        }

        throw new Error("No server found");
    }

    findServer().then((serverIp) => {
        connectToServer(serverIp);
    });
}

start();