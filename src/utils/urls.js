
export const API_URL = "https://irohub-backend-1.onrender.com"

export const getAuthorized = (additionalHeaders = {}) => {
    const user = sessionStorage.getItem('metadataUser') || '{}'

    return ({
        headers: { 
            Authorization: `Bearer ${sessionStorage.getItem('token')}`, 
            'X-Metadata': user,
            ...additionalHeaders 
        },
    })
}