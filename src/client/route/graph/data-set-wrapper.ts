import * as vis from "vis";

export class DataSetWrapper<T extends { id : number|string }> {
    public dataSet : vis.DataSet<T> = new vis.DataSet<T>([]);

    private toUpdateDict : {
        [id : string] : T|undefined,
    } = {};
    private toUpdateArray : T[] = [];
    private toAddDict : {
        [id : string] : T|undefined,
    } = {};
    private toAddArray : T[] = [];

    public get () : T[];
    public get (id : string) : T|undefined;
    public get (id? : string) : T[]|T|undefined {
        if (id == undefined) {
            const arr = this.dataSet.get();
            const inArr = new Map<number|string, number>();
            for (let i=0; i<arr.length; ++i) {
                inArr.set(arr[i].id, i);
            }
            for (const i of this.toAddArray) {
                const existingIndex = inArr.get(i.id);
                if (existingIndex == undefined) {
                    inArr.set(i.id, arr.length);
                    arr.push(i);
                } else {
                    arr[existingIndex] = i;
                }
            }
            for (const i of this.toUpdateArray) {
                const existingIndex = inArr.get(i.id);
                if (existingIndex == undefined) {
                    inArr.set(i.id, arr.length);
                    arr.push(i);
                } else {
                    arr[existingIndex] = i;
                }
            }
            return arr;
        }
        const toUpdate = this.toUpdateDict[id];
        if (toUpdate != undefined) {
            return toUpdate;
        }
        const toAdd = this.toAddDict[id];
        if (toAdd != undefined) {
            return toAdd;
        }
        return this.dataSet.get(id);
    }
    public update (item : T) {
        this.toUpdateDict[item.id] = item;
        this.toUpdateArray.push(item);
    }
    public add (item : T) {
        this.toAddDict[item.id] = item;
        this.toAddArray.push(item);
    }
    public flush () {
        this.dataSet.add(this.toAddArray);
        for (const n of this.toUpdateArray) {
            this.dataSet.update(n);
        }
        this.toUpdateDict = {};
        this.toUpdateArray = [];
        this.toAddDict = {};
        this.toAddArray = [];
    }
}
