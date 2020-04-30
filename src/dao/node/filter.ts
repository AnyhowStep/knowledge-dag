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

export function filter (args : {
    title? : string[],
    tag? : string[],
    keyword? : string[],
}) {
    return sql.and(
        ...(
            args.title == undefined ?
            [true] :
            args.title.map(title => titleLike(title))
        ),
        ...(
            args.tag == undefined ?
            [true] :
            args.tag.map(tag => tagLike(tag))
        ),
        ...(
            args.keyword == undefined ?
            [true] :
            args.keyword.map(keyword => sql.or(
                titleLike(keyword),
                tagLike(keyword)
            ))
        ),
    );
}
