// The content of the environment variable is set by src/main.ts during runtime
export let environment: {
    useProdMode: boolean,
    usePKCE: boolean,

    authority: string,
    client_id: string,
    post_logout_redirect_uri: string,
    zdataauthority: string,

    BASE_URL_INIT: string,
    BASE_URL: string,

    // If you add base urls here please also update the api check in header-interceptor.ts!
    BASE_URL_INTEGRATION: string,
    BASE_URL_FILES: string,
    UNI_JOB_SERVER_URL: string,
    ELSA_SERVER_URL: string,
    SIGNALR_PUSHHUB_URL: string,

    APP_INSIGHTS_KEY: string,

    PUBLIC_FILES_URL: string,
    LICENSE_AGREEMENT_URL: string,
    ID_PORTEN: {
        authority: string;
        client_id: string;
    },
};

export function setEnvironment(env) {
    environment = env;
}
