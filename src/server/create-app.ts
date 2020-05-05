import * as tm from "type-mapping";
import * as sql from "@squill/squill";
import * as mysql from "@squill/mysql-5.7";
import * as express from "route-express";
import * as table from "../table";
import {initRoute} from "./route-handler";
import {initGraphComputation} from "../graph-computation";

export interface CreateAppArgs {
    readonly mysql : {
        readonly host     : string;
        readonly port     : number;
        readonly database : string;
        readonly user     : string;
        readonly password : string;
    };
    readonly accessToken : string;
}

export interface CreateAppResult {
    readonly pool : sql.IPool;
    readonly app : express.IMainApp<{ locals : {} }>;
    readonly graphComputationQueue : sql.AsyncQueue<void>;
}

function mappingErrorToJsonApiErrorArrayImpl (
    visibleToUser : boolean,
    type : string,
    err : tm.MappingError,
    result : tm.jsonApi.ExpectedInputErrorObject[]
) : void {
    if (err.propertyErrors != undefined && err.propertyErrors.length > 0) {
        if (result.length == 0 && !visibleToUser) {
            /**
             * Add the root object to the array of errors
             */
            result.push({
                detail : err.message,
                source : {
                    parameter : err.inputName,
                },
                meta : {
                    type,
                    inputName : err.inputName,
                    expected : err.expected,
                    /**
                     * Include the `actualValue` for debugging.
                     * Should be okay to reveal sensitive information if
                     * `!visibleToUser`
                     */
                    actualValue : err.actualValue,
                },
            });
        }
        for (const subErr of err.propertyErrors) {
            mappingErrorToJsonApiErrorArrayImpl(visibleToUser, type, subErr, result);
        }
    } else if (err.intersectionErrors != undefined && err.intersectionErrors.length > 0) {
        for (const subErr of err.intersectionErrors) {
            mappingErrorToJsonApiErrorArrayImpl(visibleToUser, type, subErr, result);
        }
    } else {
        let unionErrors : tm.jsonApi.ExpectedInputErrorObject[]|undefined = undefined;
        if (err.unionErrors != undefined && err.unionErrors.length > 0) {
            unionErrors = [];
            for (const subErr of err.unionErrors) {
                mappingErrorToJsonApiErrorArrayImpl(visibleToUser, type, subErr, unionErrors);
            }
        }
        const meta : (
            {
                type: string;
                inputName: string;
                expected: string | undefined;
                unionErrors: tm.jsonApi.ExpectedInputErrorObject[] | undefined;
                actualValue? : unknown;
            }
        ) = {
            type,
            inputName : err.inputName,
            expected : err.expected,
            unionErrors,
        };
        if (!visibleToUser) {
            meta.actualValue = err.actualValue;
        }
        result.push({
            detail : err.message,
            source : {
                parameter : err.inputName,
            },
            meta,
        });
    }
}

function inputMappingErrorToJsonApiErrorArray (err : tm.MappingError) : tm.jsonApi.ExpectedInputErrorObject[] {
    const result : tm.jsonApi.ExpectedInputErrorObject[] = [];
    mappingErrorToJsonApiErrorArrayImpl(true, "InputError", err, result);
    return result;
}

function outputMappingErrorToJsonApiErrorArray (err : tm.MappingError) : tm.jsonApi.ExpectedInputErrorObject[] {
    const result : tm.jsonApi.ExpectedInputErrorObject[] = [];
    mappingErrorToJsonApiErrorArrayImpl(true, "OutputError", err, result);
    return result;
}

const catchErrorMiddleware = (
    err : any,
    _req : express.Request<any>,
    res : express.Response<any>,
    next : express.VoidNextFunction
) => {
    if (err == undefined) {
        next();
    } else {
        console.error(res.statusCode, err);
        if (express.isInputMappingError(err)) {
            const errors : (
                tm.jsonApi.ExpectedInputErrorObject[]
            ) = [];
            if (err.param != undefined) {
                errors.push(...inputMappingErrorToJsonApiErrorArray(err.param));
            }
            if (err.query != undefined) {
                errors.push(...inputMappingErrorToJsonApiErrorArray(err.query));
            }
            if (err.body != undefined) {
                errors.push(...inputMappingErrorToJsonApiErrorArray(err.body));
            }
            if (err.header != undefined) {
                errors.push(...inputMappingErrorToJsonApiErrorArray(err.header));
            }
            res.status(400).json({
                errors,
            });
            return;
        }

        if (express.isOutputMappingError(err)) {
            res.status(500).json({
                errors : outputMappingErrorToJsonApiErrorArray(err.response),
            });
            return;
        }

        if (err instanceof sql.RowNotFoundError) {
            res.status(404).end();
            return;
        }

        if (res.statusCode < 400 || res.statusCode >= 600) {
            res.status(400);
        }
        res.json({
            errors : [
                {
                    detail : err.message,
                }
            ],
        });
    }
};

export async function createApp (args : CreateAppArgs) : Promise<CreateAppResult> {
    /**
     * Messing with `prototype` is generally a bad idea.
     * However, I'm too lazy to do this the "right" way.
     */
    (BigInt.prototype as any).toJSON = function () {
        if (BigInt(Number(this)).toString() === this.toString()) {
            return Number(this);
        } else {
            return this.toString();
        }
    };

    const pool = new mysql.Pool({
        ...args.mysql,
        charset : mysql.CharSet.utf8mb4,
    });

    const validateResult = await pool.acquire(
        connection => table.validateTables(connection)
    );

    if (validateResult.errors.length > 0) {
        console.error(validateResult);
        process.exit(1);
    }

    if (validateResult.warnings.length > 0) {
        console.warn(validateResult.warnings);
    }

    const app = express.app();

    app.use((req, res, next) => {
        if (req.secure || (req.headers.host != undefined && req.headers.host.startsWith("localhost"))) {
            next();
        } else {
            res.redirect(307, "https://" + req.headers.host + req.url);
        }
    });

    initRoute({
        app,
        pool,
        accessToken : args.accessToken,
    });

    app.use(catchErrorMiddleware);

    const graphComputationQueue = initGraphComputation({
        pool,
        onCompute : () => {
            console.log("Computed graph");
        },
        onComputeError : (err) => {
            console.error("Could not compute graph");
            console.error(err);
        },
    });

    return {
        pool,
        app,
        graphComputationQueue,
    };
}
