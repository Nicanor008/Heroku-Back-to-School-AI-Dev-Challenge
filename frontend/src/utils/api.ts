type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions {
    method?: HttpMethod;
    body?: any;
    headers?: Record<string, string>;
}

export async function apiRequest<T>(
    endpoint: string,
    { method = "GET", body, headers }: ApiOptions = {}
): Promise<T> {
    try {
        const res = await fetch(endpoint, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }

        return (await res.json()) as T;
    } catch (error) {
        console.error("API Request failed:", error);
        throw error;
    }
}
