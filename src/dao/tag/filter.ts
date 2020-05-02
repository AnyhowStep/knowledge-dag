import * as sql from "@squill/squill";
import * as table from "../../table";

function titleLike (title : string) {
    return sql.like(
        table.tag.columns.title,
        "%" + sql.escapeLikePattern(title, "\\") + "%",
        "\\"
    );
}

export function filter (args : {
    title? : string[],
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
    );
}
