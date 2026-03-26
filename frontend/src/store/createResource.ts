type Status = 'pending' | 'success' | 'error';

export function createResource<T>(promise: Promise<T>) {
    let status: Status = 'pending';
    let result: T;
    let error: unknown;

    const suspender = promise.then(
        (data) => {
            status = 'success';
            result = data;
        },
        (err) => {
            status = 'error';
            error = err;
        }
    );

    return {
        read(): T {
            if (status === 'pending') throw suspender;
            if (status === 'error') throw error;
            return result;
        },
        reset(newPromise: Promise<T>) {
            status = 'pending';
            const s = newPromise.then(
                (data) => {
                    status = 'success';
                    result = data;
                },
                (err) => {
                    status = 'error';
                    error = err;
                }
            );
            return s;
        }
    };
}
