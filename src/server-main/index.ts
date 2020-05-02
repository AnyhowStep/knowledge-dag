import * as express from "route-express";
import {createApp} from "../server";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import {TypedEnv} from "@anyhowstep/typed-env";

if (process.env.ENV != undefined) {
    TypedEnv.Load(process.env.ENV);
}

/**
 * https://nodejs.org/api/tls.html#tls_server_setsecurecontext_options
 */
interface TlsServer {
    /**
     * https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
     */
    setSecureContext (
        options : {
            key : Buffer,
            cert : Buffer,
            ca : Buffer,
        }
    ) : void;
}

function startServer (
    {
        app,
        port,
        sslKeyPath,
        sslCertPath,
        sslCaPath,
    } :
    {
        app : express.IMainApp<{ locals : {} }>,
        port : number,
        sslKeyPath : string|undefined,
        sslCertPath : string|undefined,
        sslCaPath : string|undefined,
    }
) : Promise<void> {
    if (sslKeyPath == undefined || sslCertPath == undefined || sslCaPath == undefined) {
        return new Promise((resolve, reject) => {
            http.createServer(app).listen(
                port,
                (err? : any) => {
                    if (err == undefined) {
                        console.log(`Listening on ${port}`);
                        resolve();
                    } else {
                        reject(err);
                    }
                }
            );
        });
    } else {
        return new Promise((resolve, reject) => {
            const server = https.createServer(
                {
                    key  : fs.readFileSync(sslKeyPath),
                    cert : fs.readFileSync(sslCertPath),
                    ca   : fs.readFileSync(sslCaPath),
                },
                app
            );
            server.listen(
                port,
                (err? : any) => {
                    if (err == undefined) {
                        console.log(`Listening on ${port} with SSL`);
                        resolve();
                    } else {
                        reject(err);
                    }
                }
            );

            /**
             * https://github.com/nodejs/node/issues/4464#issuecomment-357975317
             */
            let timeout : NodeJS.Timer|undefined = undefined;
            const onSslChange = () => {
                console.log("SSL information changed");
                if (timeout != undefined) {
                    clearTimeout(timeout as any);
                }
                timeout = setTimeout(
                    () => {
                        timeout = undefined;
                        if ("setSecureContext" in server) {
                            console.log("Updating secure context...");
                            (server as TlsServer).setSecureContext({
                                key : fs.readFileSync(sslKeyPath),
                                cert: fs.readFileSync(sslCertPath),
                                ca: fs.readFileSync(sslCaPath),
                            });
                            console.log("Updated secure context");
                        } else {
                            console.error(`setSecureContext() not supported, killing server`);
                            process.exit(1);
                        }
                    },
                    2000
                ) as any;
            };
            fs.watch(sslKeyPath, onSslChange);
            fs.watch(sslCertPath, onSslChange);
            fs.watch(sslCaPath, onSslChange);
            console.log("Watching SSL paths");
        });
    }
}
async function main () {
    const {
        app,
    } = await createApp({
        mysql : {
            host     : TypedEnv.GetStringOrError("MYSQL_HOST"),
            port     : TypedEnv.GetNumber("MYSQL_PORT", 3306),
            database : TypedEnv.GetStringOrError("MYSQL_DATABASE"),
            user     : TypedEnv.GetStringOrError("MYSQL_USERNAME"),
            password : TypedEnv.GetStringOrError("MYSQL_PASSWORD"),
        },
        accessToken : TypedEnv.GetStringOrError("ACCESS_TOKEN"),
    });

    const sslKeyPath = TypedEnv.TryGetString("SSL_KEY_PATH");
    const sslCertPath = TypedEnv.TryGetString("SSL_CERT_PATH");
    const sslCaPath = TypedEnv.TryGetString("SSL_CA_PATH");

    await startServer({
        app,
        port : TypedEnv.GetNumberOrError("PORT"),
        sslKeyPath,
        sslCertPath,
        sslCaPath,
    });
}

main()
    .catch((err) => {
        console.error(`Error in main()`, err);
        process.exit(1);
    });
