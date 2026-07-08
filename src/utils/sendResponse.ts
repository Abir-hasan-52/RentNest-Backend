
type TMeta = {
    page: number;
    limit: number;
    total: number;
}


type TResponseData<T> = {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    meta?: TMeta
}


export const sendResponse = (res: any, data: TResponseData<any>) => {
    res.status(data.statusCode).json({
        success: data.success,
        statusCode: data.statusCode,
        message: data.message,
        data: data.data,
        meta: data.meta
    });
}