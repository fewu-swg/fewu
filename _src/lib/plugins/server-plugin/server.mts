import { BasicContext as Context } from '@fewu-swg/abstract-types';
import { createServer, Server as HttpServer, IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';
import { existsSync, readFileSync, statSync } from 'node:fs';
import Mime from "mime";
import { Console } from "@fewu-swg/fewu-utils";

class Server {
    serverInstance?: HttpServer;

    isServerCreated() {
        return this.serverInstance !== undefined;
    }

    create(ctx: Context) {
        Console.log(`Starting live server on ${ctx.PUBLIC_DIRECTORY}.`);
        this.serverInstance = createServer((req: IncomingMessage, res: ServerResponse) => {
            Console.log(`Request ${req.url} with method ${req.method}`);

            let localUrl = decodeURI(req.url as string);

            let targetPath = join(ctx.PUBLIC_DIRECTORY, localUrl);

            if (existsSync(targetPath)) {
                if (statSync(targetPath).isDirectory()) {
                    targetPath = join(targetPath, 'index.html');
                }
            }

            if (existsSync(targetPath)) {
                let file = (readFileSync(targetPath));
                let mimeType = Mime.getType(targetPath);
                Console.log(`Response ${targetPath}<${mimeType}>`);
                if (mimeType !== null) {
                    res.writeHead(200, { 'content-type': mimeType });
                    res.end(file);
                    return;
                }
            }
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end('');
        });
        return this;
    }

    listen(port: number) {
        if (typeof this.serverInstance === 'undefined') {
            throw new Error(`Server must be create first.`);
        }
        Console.log(`Server is alive on`, {
            msg: `localhost:${port}`,
            color: 'LIGHTGREY',
            effect: 'BOLD'
        }, '.\n        Press', {
            msg: 'Ctrl + C',
            effect: 'BOLD',
            color: 'LIGHTGREY'
        }, 'to stop.');
        this.serverInstance.listen(port);
        return this;
    }
}

export default Server;