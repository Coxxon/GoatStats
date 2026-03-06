export const getHeaders = (token) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
});

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorDetail = '';
        try {
            const errorJson = await response.json();
            errorDetail = errorJson.error || JSON.stringify(errorJson);
        } catch {
            errorDetail = await response.text();
        }
        throw new Error(`Code ${response.status}: ${errorDetail || response.statusText}`);
    }
    return response.json();
};

const getStartDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
};

const getEndDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
};

// Totaux globaux
export const fetchStats = async (token) => {
    const url = `/api/v0/stats/total?start=${getStartDate()}&end=${getEndDate()}`;
    const response = await fetch(url, { headers: getHeaders(token) });
    return handleResponse(response);
};

// Historique pour le graphique
export const fetchPageViews = async (token) => {
    // daily=1 pour avoir l'historique global par jour
    const url = `/api/v0/stats/hits?start=${getStartDate()}&end=${getEndDate()}&daily=1`;
    const response = await fetch(url, { headers: getHeaders(token) });
    return handleResponse(response);
};

// Top pages (par chemin)
export const fetchTopPages = async (token) => {
    // Sans daily=1, /stats/hits renvoie les totaux par chemin
    const url = `/api/v0/stats/hits?start=${getStartDate()}&end=${getEndDate()}`;
    const response = await fetch(url, { headers: getHeaders(token) });
    return handleResponse(response);
};
