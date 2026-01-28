export interface AxiosErrorResponse {
    message: string;
    isAccessTokenExpired?: boolean;
    isRefreshTokenExpired?: boolean;
    isUserBlocked?: boolean;
    statusCode?: number;
}

export interface ApiError extends Error {
    response?: {
        data?: AxiosErrorResponse;
        status?: number;
    };
}
