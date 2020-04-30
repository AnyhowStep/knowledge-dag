import * as tm from "type-mapping";

export const rowsPerPageMin = 1;
export const rowsPerPageMax = 300;
export const rowsPerPageDefault = 50;
export const rowsPerPageDefaultFewer = 20;

export const paginateArgs = tm.object({
    page : tm.mysql.bigIntUnsigned().orUndefined(),
    rowsPerPage : tm.withExpectedInput(
        tm.pipe(
            tm.or(
                tm.pipe(
                    tm.undefined(),
                    (_name : string, _v : undefined) => tm.BigInt(rowsPerPageDefault)
                ),
                tm.mysql.bigIntUnsigned()
            ),
            tm.bigIntGtEq(tm.BigInt(rowsPerPageMin)),
            tm.bigIntLtEq(tm.BigInt(rowsPerPageMax))
        )
    )<bigint|undefined>(),
});

export interface Paginated<T> {
    rows : T[],
    info : {
        rowsFound : bigint,
        pagesFound : bigint,
        page : bigint,
        rowsPerPage : bigint,
        rowOffset : bigint,
    }
}

export type PaginatedMapper<MapperT extends tm.AnySafeMapper> =
    tm.SafeMapper<Paginated<tm.OutputOf<MapperT>>>
;

export function paginated<MapperT extends tm.AnySafeMapper> (mapper : MapperT) : PaginatedMapper<MapperT> {
    return tm.object({
        rows : tm.array(mapper),
        info : tm.object({
            rowsFound : tm.mysql.bigIntUnsigned(),
            pagesFound : tm.mysql.bigIntUnsigned(),
            page : tm.mysql.bigIntUnsigned(),
            rowsPerPage : tm.mysql.bigIntUnsigned(),
            rowOffset : tm.mysql.bigIntUnsigned(),
        }),
    });
}
