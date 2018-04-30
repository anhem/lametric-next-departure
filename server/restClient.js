import 'isomorphic-fetch'

const restClient = {};

const resolveResponse = (response) => {
    return response.json().then(json => {
        if (response.status >= 400) {
            return Promise.reject(json);
        } else {
            return Promise.resolve(json);
        }
    });
};

restClient.get = (url) => {
    return fetch(url)
        .then(response => {
            return resolveResponse(response);
        });
};

export default restClient