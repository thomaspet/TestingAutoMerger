const userAgent = window.navigator.userAgent;
if (userAgent.indexOf('MSIE ') > -1 || userAgent.indexOf('Trident/') > -1) {
    const msg = 'Systemet støtter dessverre ikke Internet Explorer. Vennligst last ned Chrome, Firefox eller oppdater til Edge.';
    window.alert(msg)
}

// Fetch queryParams on startup and put them in sessionStorage so we can access them after the SPA router takes over
const startupParams = window.location.href.split('?')[1];
if (startupParams) {
    const paramList = startupParams.split('&');
    paramList.forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
            try {
                sessionStorage.setItem(key, value);
            } catch (e) { console.error(e) }
        }
    });
}
