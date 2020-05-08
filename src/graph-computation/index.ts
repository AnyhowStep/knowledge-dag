import * as sql from "@squill/squill";
import * as table from "../table";
import * as dag from "../dag";
import {bigIntLib} from "bigint-lib";
import {GraphCache} from "./graph-cache";

export interface InitGraphComputationArgs {
    readonly pool : sql.IPool,
    readonly onComputeError : (err : unknown) => void,
    readonly onCompute : (nodes : Set<string>) => void,
}

export function initGraphComputation (args : InitGraphComputationArgs) {
    const taskQueue = new sql.AsyncQueue<void>(() => {
        return {
            item : undefined,
            deallocate : async () => {},
        };
    });

    async function computeGraph () {
        const graphObj = await args.pool.acquireTransaction(
            sql.IsolationLevel.REPEATABLE_READ,
            async (connection) => {
                const dirtyNode = await sql.from(table.dirtyNode)
                    .orderBy(columns => [
                        columns.createdAt.desc(),
                    ])
                    .limit(1)
                    .select(columns => [
                        columns.nodeId,
                    ])
                    .fetchOne(connection)
                    .orUndefined();

                if (dirtyNode == undefined) {
                    /**
                     * No graph to recompute
                     */
                    return undefined;
                }

                const graph = new GraphCache();
                /**
                 * Caching speeds up calculations a lot.
                 * Fewer database calls, overall.
                 *
                 * However, with enough edges, you'll probably OOM the whole thing...
                 * @todo Find a way to do this that is both efficient for time and memory.
                 */
                await graph.cacheParentsAndChildren(connection);

                return {
                    dirtyNode,
                    graph,
                };
            }
        );

        if (graphObj == undefined) {
            return undefined;
        }

        const {
            graph,
            dirtyNode,
        } = graphObj;

        const {root, leaf, node} = await dag.calculateDirectParents({
            id : dirtyNode.nodeId.toString(),
            fetchAllParent : graph.getCachedParents,
            fetchAllChild : graph.getCachedChildren,
            setDirectParent : graph.setCachedDirectParent,
        });

        const depths = await dag.calculateDepths({
            root,
            leaf,
            fetchAllDirectParent : graph.getCachedDirectParents,
            fetchAllDirectChild : graph.getCachedDirectChildren,
        });

        await args.pool.acquireTransaction(
            sql.IsolationLevel.REPEATABLE_READ,
            async (connection) => {
                for (const [nodeId, parents] of graph.cachedDirectParents) {
                    for (const [parentId, direct] of parents) {
                        await table.dependency
                            .whereEqPrimaryKey({
                                nodeId : bigIntLib.BigInt(nodeId),
                                parentId : bigIntLib.BigInt(parentId),
                            })
                            .updateOne(
                                connection,
                                () => {
                                    return {
                                        direct,
                                    };
                                }
                            );
                    }
                }

                for (const [nodeId, depth] of depths) {
                    await table.node
                        .whereEqPrimaryKey({
                            nodeId : bigIntLib.BigInt(nodeId)
                        })
                        .updateOne(
                            connection,
                            () => {
                                return {
                                    depth : bigIntLib.BigInt(depth),
                                };
                            }
                        );
                }

                await table.dirtyNode
                    .where(columns => sql.inArray(
                        columns.nodeId,
                        [...node].map(nodeId => bigIntLib.BigInt(nodeId))
                    ))
                    .delete(connection);
            }
        );

        return node;
    }

    function recomputeOnCommit (evt : sql.IEventBase) {
        evt.addOnCommitListener(() => {
            if (taskQueue.getShouldStop()) {
                return;
            }
            taskQueue.enqueue(computeGraph)
                .then(
                    (node) => {
                        if (node == undefined) {
                            return;
                        }
                        args.onCompute(node);
                    },
                    (err) => {
                        args.onComputeError(err);
                    }
                );
        });
    }

    args.pool.onReplace.addHandler((evt) => {
        if (!evt.isFor(table.dirtyNode)) {
            return;
        }
        recomputeOnCommit(evt);
    });

    args.pool.onReplaceSelect.addHandler((evt) => {
        if (!evt.isFor(table.dirtyNode)) {
            return;
        }
        recomputeOnCommit(evt);
    });

    args.pool.onDelete.addHandler((evt) => {
        if (!evt.isFor(table.dirtyNode)) {
            return;
        }
        recomputeOnCommit(evt);
    });

    return taskQueue;
}
