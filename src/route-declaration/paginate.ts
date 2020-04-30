import * as rd from "route-declaration";
import * as tm from "type-mapping";
import * as m from "../mapper";

export function paginate<
    RouteT extends rd.RouteData,
    ResponseRowMapperT extends tm.AnySafeMapper
> (
    route : RouteT,
    responseRowMapper : ResponseRowMapperT
) : (
    rd.RouteUtil.SetResponse<
        rd.RouteUtil.DeepMergeQuery<
            rd.RouteUtil.SetMethod<
                RouteT,
                "GET"
            >,
            typeof m.paginateArgs
        >,
        m.PaginatedMapper<ResponseRowMapperT>
    >
) {
    return rd.RouteUtil.setResponse(
        rd.RouteUtil.deepMergeQuery(
            rd.RouteUtil.setMethod(
                route,
                "GET"
            ),
            m.paginateArgs
        ),
        m.paginated(responseRowMapper)
    );
}
