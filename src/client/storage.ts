const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";

export const storage = {
    getAccessToken () {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },
    setAccessToken (value : string) {
        localStorage.setItem(ACCESS_TOKEN_KEY, value);
    },
    unsetAccessToken () {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
};
