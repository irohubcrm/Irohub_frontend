
export const API_URL = "http://localhost:5000"

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