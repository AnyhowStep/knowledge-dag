export class NodeTagUtil {
    public static ToTitle (str : string) {
        str = str
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
        if (str.length > 255) {
            str = str.substr(0, 255);
        }
        return str;
    }
}
