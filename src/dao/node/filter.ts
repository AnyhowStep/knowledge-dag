import * as sql from "@squill/squill";
import * as table from "../../table";

function titleLike (title : string) {
    return sql.like(
        sql.LogUtil.CorrelatedSubquery.latestValue(
            table.editLog,
            columns => columns.edit.title
        ),
        "%" + sql.escapeLikePattern(title, "\\") + "%",
        "\\"
    );
}

function tagLike (tag : string) {
    return sql.exists(
        sql.requireOuterQueryJoins(table.node)
            .from(table.nodeTag)
            .whereEqOuterQueryPrimaryKey(
                tables => tables.nodeTag,
                tables => tables.node
            )
            .innerJoinUsingPrimaryKey(
                tables => tables.nodeTag,
                table.tag
            )
            .where(columns => sql.like(
                columns.tag.title,
                "%" + sql.escapeLikePattern(tag, "\\") + "%",
                "\\"
            ))
    );
}

function tagEqual (tag : string) {
    return sql.exists(
        sql.requireOuterQueryJoins(table.node)
            .from(table.nodeTag)
            .whereEqOuterQueryPrimaryKey(
                tables => tables.nodeTag,
                tables => tables.node
            )
            .innerJoinUsingPrimaryKey(
                tables => tables.nodeTag,
                table.tag
            )
            .where(columns => sql.eq(
                columns.tag.title,
                tag
            ))
    );
}

export function filter (args : {
    title? : string[],
    tag? : string[],
    keyword? : string[],

    tagExact? : string[],
}) {
    /**
     * We `.slice(0, 5)` as a naive attempt at preventing DoS through querying
     */
    return sql.and(
        ...(
            args.title == undefined ?
            [true] :
            args.title.slice(0, 5).map(title => titleLike(title))
        ),
        ...(
            args.tag == undefined ?
            [true] :
            args.tag.slice(0, 5).map(tag => tagLike(tag))
        ),
        ...(
            args.keyword == undefined ?
            [true] :
            args.keyword.slice(0, 5).map(keyword => sql.or(
                titleLike(keyword),
                tagLike(keyword)
            ))
        ),
        ...(
            args.tagExact == undefined ?
            [true] :
            args.tagExact.slice(0, 5).map(tagExact => tagEqual(tagExact))
        ),
    );
}
