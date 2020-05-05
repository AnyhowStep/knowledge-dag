import * as sql from "@squill/squill";
import * as table from "../table";

export class GraphCache {
    private cachedParents        = new Map<string, string[]>();
    private cachedChildren       = new Map<string, string[]>();
    public  cachedDirectParents  = new Map<string, Map<string, boolean>>();
    public  cachedDirectChildren = new Map<string, Map<string, boolean>>();

    public constructor () {
    }

    public cacheParentsAndChildren = async (connection : sql.IsolatedSelectConnection) => {
        const all = await sql.from(table.dependency)
            .select(columns => [
                columns.nodeId,
                columns.parentId,
            ])
            .fetchAll(connection);

        for (const row of all) {
            {
                let p = this.cachedParents.get(row.nodeId.toString());
                if (p == undefined) {
                    p = [];
                    this.cachedParents.set(row.nodeId.toString(), p);
                }
                p.push(row.parentId.toString());
            }
            {
                let c = this.cachedChildren.get(row.parentId.toString());
                if (c == undefined) {
                    c = [];
                    this.cachedChildren.set(row.parentId.toString(), c);
                }
                c.push(row.nodeId.toString());
            }
        }
    };

    public getCachedParents = async (id : string) => {
        const cached = this.cachedParents.get(id);
        if (cached == undefined) {
            return [];
        }
        return cached;
    };
    public getCachedChildren = async (id : string) => {
        const cached = this.cachedChildren.get(id);
        if (cached == undefined) {
            return [];
        }
        return cached;
    };
    public setCachedDirectParentSync = (nodeId : string, parentId : string, direct : boolean) => {
        {
            let p = this.cachedDirectParents.get(nodeId);
            if (p == undefined) {
                p = new Map<string, boolean>();
                this.cachedDirectParents.set(nodeId, p);
            }
            p.set(parentId, direct);
        }
        {
            let c = this.cachedDirectChildren.get(parentId);
            if (c == undefined) {
                c = new Map<string, boolean>();
                this.cachedDirectChildren.set(parentId, c);
            }
            c.set(nodeId, direct);
        }
    };
    public setCachedDirectParent = async (nodeId : string, parentId : string, direct : boolean) => {
        this.setCachedDirectParentSync(nodeId, parentId, direct);
    };
    public getCachedDirectParents = async (id : string) => {
        const cached = this.cachedDirectParents.get(id);
        if (cached == undefined) {
            return [];
        }
        const result : string[] = [];
        for (const kvp of cached) {
            const parent = kvp[0];
            const direct = kvp[1];
            if (direct) {
                result.push(parent);
            }
        }
        return result;
    };
    public getCachedDirectChildren = async (id : string) => {
        const cached = this.cachedDirectChildren.get(id);
        if (cached == undefined) {
            return [];
        }
        const result : string[] = [];
        for (const kvp of cached) {
            const child  = kvp[0];
            const direct = kvp[1];
            if (direct) {
                result.push(child);
            }
        }
        return result;
    };
}
