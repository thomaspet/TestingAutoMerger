// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    useProdMode: false,
    BASE_URL_INIT: '',
    BASE_URL: '',
    BASE_URL_INTEGRATION: 'https://dev-integration.unieconomy.no/',
    BASE_URL_FILES: 'https://dev-unifiles.unieconomy.no/',
    UNI_PUSH_ADAPTER_URL: 'https://dev-unipushadapter.unieconomy.no',
    UNI_JOB_SERVER_URL: 'https://devapi-unijobserver.unieconomy.no/api/',
    ELSA_SERVER_URL: 'https://dev-admin.unieconomy.no',

    API_DOMAINS: {
        INIT: '/api/init/',
        BUSINESS: '/api/biz/',
        ROOT: '/api/',
        METADATA: '/api/metadata/',
        STATISTICS: '/api/statistics/',
        UMH: '/api/umh/'
    },

    INTEGRATION_DOMAINS: {
        ALTINN: '/api/altinn/'
    },

    DEFAULT_HEADERS: {
        'Content-Type': 'application/json'
    },

    RAYGUN_API_KEY: 'N+W68kn/cIAm0QW4DdH6NQ==',

    SITE_KEY: '6LdMqT0UAAAAAEqsKmTCjEUcCnic_htqpjkmry2d',

    STIMULSOFT_LICENSE: '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHlQ9nKHW5xxs/tCjGsgWb6rWj7uUX3wCSckA495fAQHHkM8hO'
        + '+uFiXxRz+4NUYE2gKuBss/plBZutOtsinTBHyJQeXyv4BUK1Zn6BNv/nahgb+IyNQTTIuPeptIs83z6auntAOO0Y2+'
        + '0Fqi3RR8tP9UxKLcxqIvqgaBZc0zSHe1oho22a0Jw5J7c39OasrRo34cWAnnwAzV9PVCJdn3ZOuq2g9/8vUPXMJ4d5'
        + 'rNPBt0ecy4574bbFadNGYxiuYPlhZJqC2gcdXSKLk4dfPPyxOrLw4jrXcATnkwUZIl6+QJA4gA5OC6w7oXfuKTrYjB'
        + '47cq1s2GuBfAjg0i9/GQvosPwPwr1KjELc8TGJflBD59Ls0YEYCRx3VNCWkoPiJny8TwBbhVWXlMPkCac/xkqojKoI'
        + '3PgKoHZNTPA7cwEV5eFBV7rIogCVaAf/yrDYSspoaS77Xa99qv0oWIPvKZpta/x59Y47bqzZ5SGYestTSxmxlfvSGa'
        + 'yXbhqZkmPRK07NnOKmeuxknE+/RywyCQZS9svfkZT1Jn0m0xdX4+rwma2fTSCluY4fUEF38fhNFj/keKeLIwIMwSOh'
        + 'Ypv0Eu/SeTn6DSEWgBGcW2jbWadOO+CmGAOg1XfM82jGlN68wfGjsNNswAez71QNSnBvMrFVsRFGDq+K/zAYRavq23'
        + 'xzCJ9QnukzFeuN1Juxtg3y2tRiJYPJyyrwHGhTY550oa1AP/trUev/gvk4gpFyGpAoFR8jca5GAGEDyTf2pi44J/S78=',

    TRAVEL_DEACTIVATED: false
};

