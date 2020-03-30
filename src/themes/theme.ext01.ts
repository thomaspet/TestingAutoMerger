import {TRANSLATION_OVERRIDES} from './ext01/translation-overrides';
import {DASHBOARD_CONFIG, ACCOUNTING_DASHBOARD_CONFIG, BANK_DASHBOARD_CONFIG, SALARY_DASHBOARD_CONFIG} from './ext01/dashboard-config';

export const theme = {
    translationOverrides: TRANSLATION_OVERRIDES,
    dashboardConfig: DASHBOARD_CONFIG,
    accountingDashboardConfig: ACCOUNTING_DASHBOARD_CONFIG,
    bankDashboardConfig: BANK_DASHBOARD_CONFIG,
    salaryDashboardConfig: SALARY_DASHBOARD_CONFIG,


    init: {
        illustration: 'themes/ext01/register-company-background.svg',
        background: '#ebf6fb',
        login_background: 'url(themes/ext01/login_background.png)',
        backgroundHeight: '100%',
    },

    widgets: {
        pie_colors: ['#005AA4', '#0071CD', '#008ED2', '#7FC6E8', '#A1DFFF', '#CEEEFF', '#DFF1F9', '#f6dc8d', '#4DB6AC'],
        due_date_colors: ['#008A00', '#E7A733', '#FF9100', '#DA3D00', '#A20076'],
        bar_chart_colors: ['#0071cd', '#E3E3E3'],
        result_bar_colors: ['#0071CD', '#7FC6E8', 'rgba(89, 104, 121, .75)'],
        kpi: {
            good: '#008A00',
            bad: '#E60000',
            warn: '#FF9100',
            c2a: '#0071cd',
            background: '#F4F4F4'
        }
    },

    // tslint:disable
    icons: {
        home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">&gt;<g class="sr-icon"><path d="M23.4 10.4l-3.2-2.5V2.5c0-.7-.6-1.3-1.3-1.3h-3.2c-.7 0-1.3.6-1.3 1.3v.6l-1.7-1.4c-.5-.4-1.2-.4-1.7 0L-.1 10.5c-.3.2-.4.7-.1.9l.2.2c.2.3.6.4.9.1l10.9-8.6L16 6.5V2.8h2.6v5.8l3.8 3c.3.2.7.2.9-.1l.2-.2c.2-.3.1-.7-.1-.9z"/><path d="M18.6 21.2h-14v-9.7L3 12.7v8.7c0 .7.6 1.3 1.3 1.3h14.6c.7 0 1.3-.6 1.3-1.3v-8.8l-1.7-1.3v9.9z"/></g></svg>`,
        sales: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="sr-icon"><path d="M1.5 13.8L6.7 9l2.9 2.6c.3.2.7.2 1 0l9.3-8.7.4.4c.4.4 1 .1 1-.4V.8c0-.3-.3-.6-.6-.6h-2.1c-.5 0-.8.6-.4 1l.5.5-8.6 8-2.9-2.6c-.3-.2-.7-.2-.9 0L.4 12.5c-.2.2-.3.4-.3.6 0 .8.9 1.2 1.4.7zM23.3 22.1h-1.9V9.9c0-.8-.6-1.4-1.4-1.4h-2.7c-.8 0-1.4.6-1.4 1.4v12.2h-1.1V15c0-.8-.6-1.4-1.4-1.4h-2.7c-.8 0-1.4.6-1.4 1.4v7.1H8.1V19c0-.8-.6-1.4-1.4-1.4H4c-.8 0-1.4.6-1.4 1.4v3.1H.7c-.4 0-.7.3-.7.7v.3c0 .4.3.7.7.7h22.6c.4 0 .7-.3.7-.7v-.3c0-.4-.3-.7-.7-.7zm-16.9 0h-2v-2.7h2v2.7zm6.7 0h-2v-6.8h2v6.8zm6.6 0h-2V10.2h2v11.9z"/></g></svg>`,
        accounting: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22.6 0H1.4C.6 0 0 .7 0 1.4v21.2c0 .8.7 1.4 1.4 1.4h21.2c.8 0 1.4-.6 1.4-1.4V1.4c0-.8-.7-1.4-1.4-1.4zm-.2 1.6v4.1h-1.5c-.3-1-1.2-1.7-2.2-1.7-1 0-1.9.7-2.2 1.6h-4.9C11.2 4.7 10.4 4 9.3 4s-1.9.7-2.2 1.6H7C6.6 4.7 5.8 4 4.7 4c-1 0-1.9.7-2.2 1.6h-.9v-4h20.8zm-2.1 15.2c-.3-.9-1.2-1.6-2.2-1.6-1 0-1.9.7-2.2 1.6h-.2c-.3-.9-1.2-1.6-2.2-1.6s-1.9.7-2.2 1.6H7c-.3-.9-1.2-1.6-2.2-1.6s-1.9.7-2.2 1.6h-1v-4.1h11.7c.3.9 1.2 1.6 2.2 1.6 1 0 1.8-.6 2.2-1.4.4.8 1.2 1.4 2.2 1.4 1 0 1.9-.7 2.2-1.6h.3v4h-2.1zm-.9.8c0 .8-.6 1.4-1.4 1.4-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4zm-4.6 0c0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4c0-.8.6-1.4 1.4-1.4.7 0 1.4.6 1.4 1.4zm-8.7 0c0 .8-.6 1.4-1.4 1.4-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4zm8-5.6c0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4c-.8 0-1.4-.6-1.4-1.4zm4.3 0c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4-.6 1.4-1.4 1.4-1.4-.6-1.4-1.4zm3.7-.8c-.3-.9-1.2-1.6-2.2-1.6-1 0-1.8.6-2.2 1.4-.4-.8-1.2-1.4-2.2-1.4-1 0-1.9.7-2.2 1.6H1.6v-4h.9c.3.9 1.2 1.6 2.2 1.6 1 0 1.9-.7 2.2-1.6H7c.3.9 1.2 1.6 2.2 1.6 1 0 1.9-.7 2.2-1.6h4.9c.3.9 1.2 1.6 2.2 1.6 1 0 1.9-.7 2.2-1.6h1.5v4h-.1zM3.4 6.4C3.4 5.6 4 5 4.7 5c.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4c-.7 0-1.3-.6-1.3-1.4zm4.6 0C8 5.6 8.6 5 9.3 5c.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4C8.6 7.8 8 7.2 8 6.4zm9.3 0c0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4c-.8 0-1.4-.6-1.4-1.4zm-15.7 16v-4h.9c.3.9 1.2 1.6 2.2 1.6 1 0 1.9-.7 2.2-1.6h4.2c.3.9 1.2 1.6 2.2 1.6 1 0 1.9-.7 2.2-1.6h.2c.4.9 1.3 1.6 2.3 1.6 1.1 0 2-.7 2.3-1.6h2.1v4.1H1.6z"/></svg>`,
        expense: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="sr-icon"><path d="M22.4 4.9h-13l9-1.8c.5-.1.9.1 1.2.4.2.3.5.4.8.3h.1c.5-.1.8-.8.5-1.2-.6-.9-1.8-1.4-2.9-1.2L1.3 4.7C.5 4.8 0 5.5 0 6.2V21c0 .9.7 1.6 1.6 1.6h20.8c.9 0 1.6-.7 1.6-1.6V6.5c0-.9-.7-1.6-1.6-1.6zm-.1 10.2h-5.5c-.6 0-1.1-.5-1.1-1.1v-1.7c0-.6.5-1.1 1.1-1.1h5.5v3.9zm0-5.5h-5.5c-1.5 0-2.8 1.2-2.8 2.8V14c0 1.5 1.2 2.8 2.8 2.8h5.5v4.1H1.7V6.6h20.6v3z"/><path class="st0" d="M18 14.1c.5 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .5 1 1 1z"/></g></svg>`,
        bank: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="sr-icon"><path d="M1.3 10.1h21.3c.4 0 .7-.2.8-.6.1-.3 0-.7-.3-.9L12.5.9c-.3-.2-.7-.2-1 0L.8 8.6c-.3.2-.4.6-.3.9s.5.6.8.6zM12 2.6l8 5.8H3.9L12 2.6zM4.7 17.7v-6.5c0-.4-.3-.8-.8-.8s-.8.3-.8.8v6.5c0 .4.3.8.8.8s.8-.3.8-.8zM10.1 17.7v-6.5c0-.4-.3-.8-.8-.8s-.8.3-.8.8v6.5c0 .4.3.8.8.8s.8-.3.8-.8zM15.5 17.7v-6.5c0-.4-.3-.8-.8-.8s-.8.3-.8.8v6.5c0 .4.3.8.8.8s.8-.3.8-.8zM20.9 17.7v-6.5c0-.4-.3-.8-.8-.8-.4 0-.8.3-.8.8v6.5c0 .4.3.8.8.8.4 0 .8-.3.8-.8zM.9 20.2c0 .5.4.8.8.8h20.5c.5 0 .8-.4.8-.8 0-.5-.4-.8-.8-.8H1.7c-.4-.1-.8.3-.8.8zM23.1 21.5H.9c-.5 0-.9.4-.9.8s.4.8.9.8H23c.5 0 .9-.4.9-.8s-.3-.8-.8-.8z"/></g></svg>`,
        salary: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="sr-icon"><path class="st0" d="M8.4 1c2.5 0 4.5 2 4.5 4.4v1.5c0 2.4-2 4.4-4.5 4.4h-.1c-2.5 0-4.5-2-4.5-4.4V5.4c0-2.5 2-4.4 4.6-4.4zm-.2 1.7c-1.7 0-2.9 1.2-2.9 2.7v1.4c0 1.5 1.3 2.7 2.9 2.7h.1c1.6 0 2.9-1.2 2.9-2.7V5.4c-.1-1.5-1.4-2.7-3-2.7zM15.9 1.5c-.4 0-.7.3-.7.7v.3c0 .4.3.7.7.7h4.9c.4 0 .7-.3.7-.7v-.3c0-.4-.3-.7-.7-.7h-4.9zM15.9 5.1c-.4 0-.7.3-.7.7v.3c0 .4.3.7.7.7h7.4c.4 0 .7-.3.7-.7v-.3c0-.4-.3-.7-.7-.7h-7.4zM15.9 8.6c-.4 0-.7.3-.7.7v.3c0 .4.3.7.7.7h7.4c.4 0 .7-.3.7-.7v-.3c0-.4-.3-.7-.7-.7h-7.4zM13.4 12.2c-.2 0-.5.1-.6.3l-.2.3c-.2.3-.1.6.2.9 1.1.8 1.8 2.2 1.8 3.6v4H1.8v-4c0-1.4.7-2.7 1.8-3.6.3-.2.3-.6.2-.9l-.2-.3c-.2-.4-.7-.4-1-.2C1 13.5 0 15.4 0 17.3v4.3c0 .8.6 1.4 1.4 1.4H15c.8 0 1.4-.6 1.4-1.4v-4.3c0-1.9-1-3.7-2.6-4.9-.1-.1-.2-.2-.4-.2z"/></g></svg>`,
        timetracking: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="sr-icon"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 22.3C6.3 22.3 1.7 17.7 1.7 12 1.7 6.3 6.3 1.7 12 1.7c5.7 0 10.3 4.6 10.3 10.3 0 5.7-4.6 10.3-10.3 10.3z"/><path d="M12.8 11.7V5.2c0-.4-.3-.7-.7-.7h-.3c-.4 0-.7.3-.7.7v6.9c0 .2.1.4.2.5l2.8 2.8c.3.3.7.3 1 0l.2-.2c.3-.3.3-.7 0-1l-2.5-2.5z"/></g></svg>`,
        project: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path class="sr-icon" d="M2.4 22.2c-1.2 0-2.1-.9-2.1-2.1V7.5c0-1.2.9-2.1 2.1-2.1h4.9V3.9c0-1.1.9-2 2-2h5.4c1.1 0 2 .9 2 2v1.5h4.9c1.2 0 2.1.9 2.1 2.1v12.6c0 1.2-.9 2.1-2.1 2.1H2.4zM2.2 7.5v12.6c0 .1.1.1.1.1h19.2c.1 0 .1-.1.1-.1V7.5c0-.1-.1-.1-.1-.1H2.4c-.1 0-.2 0-.2.1zm12.6-2.1l.1-.1V3.9c0-.1-.1-.2-.2-.2H9.3c-.1 0-.2.1-.2.2v1.4c0 .1 0 .1.1.1h5.6z"/></svg>`,
        dimensions: 'developer_board',
        marketplace: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.7 21.5c-1.5 0-2.6-1.1-2.6-2.6 0-.3.1-.6.2-.9h-3.5c.1.3.2.6.2.9 0 1.5-1.1 2.6-2.6 2.6s-2.6-1.1-2.6-2.6c0-.7.3-1.4.9-2L3.2 4.2H1.1c-.5 0-.9-.4-.9-.9s.4-.9.9-.9h2.6c.4 0 .7.3.9.6l.7 2.1h17.6c.5 0 .7.2.8.4.1.2.2.5.1.8l-2.5 8c-.1.4-.5.6-.9.6H8.7l.5 1.3h8.6c1.3.1 2.4 1.2 2.4 2.6.1 1.5-1.1 2.7-2.5 2.7zm-8.4-3.6c-.5 0-.9.4-.9.9s.4.9.9.9.9-.4.9-.9c-.1-.5-.4-.9-.9-.9zm8.5-.1c-.5 0-.9.4-.9.9s.4.9.9.9.9-.4.9-.9-.5-.9-.9-.9zm1.9-4.7l1.9-6.2H5.9l2.2 6.2h11.6z"/><path d="M23.4 5.7c-.1-.2-.3-.3-.6-.3H5.1l-.7-2.2c-.1-.3-.4-.5-.7-.5H1.1c-.4 0-.7.3-.7.7s.3.7.7.7h2.2L7.8 17c-.6.5-1 1.2-1 1.9 0 1.3 1.1 2.4 2.4 2.4 1.3 0 2.4-1.1 2.4-2.4 0-.4-.1-.8-.3-1.1h4.1c-.2.3-.3.7-.3 1.1 0 1.3 1.1 2.4 2.4 2.4 1.3 0 2.4-1.1 2.4-2.4 0-1.3-1-2.3-2.2-2.4H9.1l-.7-1.7h11.9c.3 0 .6-.2.7-.5l2.5-8c.1-.2 0-.4-.1-.6zM10.3 18.8c0 .6-.5 1.1-1.1 1.1s-1.1-.5-1.1-1.1c0-.6.5-1.1 1.1-1.1.7 0 1.1.5 1.1 1.1zm7.5 1c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1c.6 0 1.1.5 1.1 1.1s-.6 1.1-1.1 1.1zm2.1-6.5h-12L5.6 6.7h16.3l-2 6.6z"/></svg>`,
        altinn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path class="st0" d="M13.5,14.8c0.7,0,1.3-0.6,1.3-1.3v-3c0-0.7-0.6-1.3-1.3-1.3h-3c-0.7,0-1.3,0.6-1.3,1.3v3c0,0.7,0.6,1.3,1.3,1.3H13.5z"/><path class="st0" d="M21.3,2.3H3c-0.5,0-1,0.4-1,1v0.3c0,0.5,0.4,1,1,1h16.8v11.3c0,0.5,0.4,1,1,1H21c0.5,0,1-0.4,1-1V4.6V3C22,2.6,21.7,2.3,21.3,2.3z"/><path class="st0" d="M21,19.4H4.3V8.1c0-0.5-0.4-1-1-1H3c-0.5,0-1,0.4-1,1v11.3v1.5c0,0.4,0.3,0.8,0.8,0.8H21c0.5,0,1-0.4,1-1v-0.3C22,19.8,21.6,19.4,21,19.4z"/></g></svg>`,

        search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23.6 22.3l-6-6c1.5-1.8 2.4-4.1 2.4-6.4 0-2.6-1-5.1-2.9-7S12.8 0 10.1 0 5 1 3.1 2.9.2 7.2.2 9.9s1 5.1 2.9 7 4.3 2.9 7 2.9c2.2 0 4.3-.7 6-2l6 6c.3.3.8.3 1.1 0l.4-.4c.3-.3.3-.8 0-1.1zm-19-6.9C3.1 14 2.3 12 2.3 9.9s.8-4 2.3-5.5S8 2.1 10.1 2.1s4 .8 5.5 2.3 2.3 3.4 2.3 5.5-.8 4-2.3 5.5-3.4 2.3-5.5 2.3-4-.8-5.5-2.3z"/></svg>`,
        // company: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="sr-icon"><path d="M21 19v-7.8c0-.6-.5-1.1-1.1-1.1h-6.4c-.6 0-1.1.5-1.1 1.1V19h-1V4.8c0-.6-.5-1.1-1.1-1.1H4c-.6 0-1.1.5-1.1 1.1V19H.5c-.3 0-.5.2-.5.5v.2c0 .3.2.5.5.5h22.9c.3 0 .5-.2.5-.5v-.2c0-.3-.2-.5-.5-.5H21zm-7.2-7.6h5.9V19h-5.9v-7.6zM4.3 5.1h5.9V19H4.3V5.1z"/><path d="M5.8 8.3h.4c.3 0 .5-.2.5-.5v-.9c0-.3-.2-.5-.5-.5h-.4c-.3 0-.5.2-.5.5v.9c0 .2.2.5.5.5zM7.7 6.9v.9c0 .3.2.5.5.5h.5c.3 0 .5-.3.5-.5v-.9c0-.3-.2-.5-.5-.5h-.5c-.3-.1-.5.2-.5.5zM5.8 11.4h.4c.3 0 .5-.2.5-.5V10c0-.3-.2-.5-.5-.5h-.4c-.3 0-.5.2-.5.5v.9c0 .3.2.5.5.5zM8.2 11.4h.5c.3 0 .5-.2.5-.5V10c0-.3-.2-.5-.5-.5h-.5c-.3 0-.5.2-.5.5v.9c0 .3.2.5.5.5zM5.8 14.5h.4c.3 0 .5-.2.5-.5v-.9c0-.3-.2-.5-.5-.5h-.4c-.3 0-.5.2-.5.5v.9c0 .2.2.5.5.5zM8.2 14.5h.5c.3 0 .5-.2.5-.5v-.9c0-.3-.2-.5-.5-.5h-.5c-.3 0-.5.2-.5.5v.9c0 .2.2.5.5.5zM15.4 14.5h.4c.3 0 .5-.2.5-.5v-.9c0-.3-.2-.5-.5-.5h-.4c-.3 0-.5.2-.5.5v.9c-.1.2.2.5.5.5zM17.2 13.1v.9c0 .3.2.5.5.5h.4c.3 0 .5-.2.5-.5v-.9c0-.3-.2-.5-.5-.5h-.4c-.2-.1-.5.2-.5.5z"/></g></svg>`,
        company: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path class="st0" d="M10.1,6.7h0.6c0.4,0,0.7-0.3,0.7-0.7V4.7c0-0.4-0.3-0.7-0.7-0.7h-0.6c-0.4,0-0.7,0.3-0.7,0.7V6C9.3,6.3,9.6,6.7,10.1,6.7z"/><path class="st0" d="M13.6,6.7h0.7C14.7,6.7,15,6.3,15,6V4.7c0-0.4-0.3-0.7-0.7-0.7h-0.7c-0.4-0.1-0.7,0.3-0.7,0.7V6C12.8,6.4,13.1,6.7,13.6,6.7z"/><path class="st0" d="M10.1,11.2h0.6c0.4,0,0.7-0.3,0.7-0.7V9.2c0-0.4-0.3-0.7-0.7-0.7h-0.6c-0.4,0-0.7,0.3-0.7,0.7v1.3C9.3,10.9,9.6,11.2,10.1,11.2z"/><path class="st0" d="M13.6,11.2h0.7c0.4,0,0.7-0.3,0.7-0.7V9.2c0-0.4-0.3-0.7-0.7-0.7h-0.7c-0.4,0-0.7,0.3-0.7,0.7v1.3C12.8,10.9,13.1,11.2,13.6,11.2z"/><path class="st0" d="M10.1,15.7h0.6c0.4,0,0.7-0.3,0.7-0.7v-1.3c0-0.4-0.3-0.7-0.7-0.7h-0.6c-0.4,0-0.7,0.3-0.7,0.7V15C9.3,15.3,9.6,15.7,10.1,15.7z"/><path class="st0" d="M13.6,15.7h0.7c0.4,0,0.7-0.3,0.7-0.7v-1.3c0-0.4-0.3-0.7-0.7-0.7h-0.7c-0.4,0-0.7,0.3-0.7,0.7V15C12.8,15.3,13.1,15.7,13.6,15.7z"/><path class="st0" d="M21.5,22.3H21h-2.8h0V1.6c0-0.9-0.7-1.6-1.6-1.6H7.5C6.6,0,5.9,0.7,5.9,1.6v20.7H2.4c-0.4,0-0.7,0.3-0.7,0.7v0.3c0,0.4,0.3,0.7,0.7,0.7h15.9H21h0.5c0.5,0,0.9-0.4,0.9-0.9v0C22.4,22.6,22,22.3,21.5,22.3z M16.5,22.3H7.9V2h8.6V22.3z"/></g></svg>`,
        add: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><g><path class="st0" d="M12,0C5.4,0,0,5.4,0,12c0,6.6,5.4,12,12,12c6.6,0,12-5.4,12-12C24,5.4,18.6,0,12,0z M12,22.3C6.3,22.3,1.7,17.7,1.7,12C1.7,6.3,6.3,1.7,12,1.7c5.7,0,10.3,4.6,10.3,10.3C22.3,17.7,17.7,22.3,12,22.3z"/><path class="st0" d="M16.6,11.1h-3.7V7.4c0-0.4-0.3-0.7-0.7-0.7h-0.4c-0.4,0-0.7,0.3-0.7,0.7v3.7H7.4c-0.4,0-0.7,0.3-0.7,0.7v0.4c0,0.4,0.3,0.7,0.7,0.7h3.7v3.7c0,0.4,0.3,0.7,0.7,0.7h0.4c0.4,0,0.7-0.3,0.7-0.7v-3.7h3.7c0.4,0,0.7-0.3,0.7-0.7v-0.4C17.3,11.4,17,11.1,16.6,11.1z"/></g></svg>`,
        // add: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`,
        notifications: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="sr-icon"><path d="M22.2 17.5c-.3-.3-.8-.6-.9-.8-1.5-1.2-1.6-1.7-2.1-3.6-.1-.5-.2-1-.4-1.6-.1-.5-.3-1-.4-1.5-.8-2.8-1.3-5-4-5.8V2.4C14.4 1.1 13.3 0 12 0c-1.3 0-2.4 1.1-2.4 2.4v1.8c-2.6.8-3.2 3-4 5.8-.1.5-.2 1-.4 1.5-.2.6-.3 1.1-.4 1.6-.5 1.8-.6 2.4-1.9 3.4-.2.2-.8.6-1.2.9-.3.2-.5.7-.5 1.1v.8c0 .8.7 1.4 1.4 1.4h18.7c.8 0 1.4-.6 1.4-1.4v-.8c.1-.4-.1-.7-.5-1zM11 2.4c0-.5.4-.9.9-.9s1 .4 1 .9V4H11V2.4zM21 19H3v-.2c2.7-2.1 2.8-2.7 3.5-5.2.1-.5.2-1 .4-1.6.1-.5.3-1 .4-1.5C8.2 7 8.6 5.6 12 5.6c3.4 0 3.8 1.3 4.7 4.8.1.5.2 1 .4 1.5.2.6.3 1.1.4 1.6.7 2.6.9 3.1 3.5 5.2v.3zM12 24c1.2 0 2.2-1 2.2-2.2H9.9c0 1.2.9 2.2 2.1 2.2z"/></g></svg>`,
        settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="sr-icon"><path d="M12 18.3c-3.4 0-6.1-2.8-6.1-6.1C5.9 8.8 8.6 6 12 6c3.4 0 6.1 2.8 6.1 6.1 0 3.4-2.7 6.2-6.1 6.2zm0-10.6c-2.5 0-4.5 2-4.5 4.5 0 2.4 2 4.4 4.5 4.4s4.5-2 4.5-4.5c0-2.4-2-4.4-4.5-4.4z"/><path d="M12 18.1c-3.3 0-5.9-2.7-5.9-5.9 0-3.3 2.7-6 5.9-6 3.3 0 5.9 2.7 5.9 5.9 0 3.3-2.6 6-5.9 6zm0-10.6c-2.6 0-4.7 2.1-4.7 4.7s2.1 4.6 4.7 4.6 4.7-2.1 4.7-4.7c0-2.5-2.1-4.6-4.7-4.6z"/><path d="M12 6.3c-3.2 0-5.8 2.7-5.8 5.9S8.8 18 12 18s5.8-2.7 5.8-5.9-2.6-5.8-5.8-5.8zm0 10.6c-2.6 0-4.8-2.1-4.8-4.7S9.4 7.4 12 7.4s4.8 2.1 4.8 4.7-2.2 4.8-4.8 4.8z"/><path d="M9 23.8h-.2c-.6-.2-1.2-.4-1.7-.6-.1 0-.2-.1-.3-.2-.5-.6-.7-1.4-.5-2.1 0 0 0-.1.1-.2 0-.2-.1-.5-.3-.7l-.6-.5c-.2-.1-.4-.2-.6-.2h-.2c-.1.1-.2.1-.3.1-.2.1-.5.2-.8.2-.4 0-.9-.1-1.2-.3-.1 0-.3-.2-.3-.3-.3-.4-.6-.9-.9-1.5-.1-.2-.2-.3-.2-.4 0-.7.4-1.5 1-1.9 0 0 .1-.1.2-.1.1-.1.2-.4.2-.7-.1-.2-.1-.5-.1-.7-.1-.5-.5-.6-.5-.6h-.1C1 12.9.4 12.3.1 11.6v-.3c.1-.7.2-1.2.3-1.8 0-.1.1-.2.2-.3.4-.8 1.1-1.1 1.8-1.1h.2c.2 0 .5-.1.7-.4v-.1c.1-.2.2-.4.4-.6.1-.3.1-.5 0-.8v-.1c-.5-.7-.5-1.5-.2-2.3.1-.1.1-.2.2-.3.4-.4.8-.8 1.3-1.1 0 0 .2-.1.3-.1h.4c.6 0 1.2.2 1.7.6h.1s.2.2.5.2c.1 0 .2 0 .3-.1.3 0 .5-.1.7-.2.5-.2.5-.6.5-.6v-.1l.1-.1c.1-.7.5-1.4 1.2-1.8 0 0 .2-.1.3-.1h1.6c.1 0 .3.1.3.1.7.4 1.2 1.1 1.3 1.8v.2s.1.4.5.6c.2 0 .5.1.7.2.1 0 .2.1.3.1.3 0 .5-.2.5-.2s.1-.1.2-.1c.4-.4 1-.6 1.6-.6.2 0 .3 0 .5.1.1 0 .2.1.3.1.4.3.9.7 1.3 1.1.1.1.2.2.2.3.3.7.2 1.5-.2 2.2 0 .1-.1.1-.1.2s-.2.4.1.8c.1.1.1.2.2.3.1.1.1.2.2.3.3.4.6.5.7.5h.1c.8 0 1.5.3 2 .9.1.1.1.1.1.2.2.6.3 1.1.3 1.8v.4c-.3.7-.8 1.3-1.5 1.5.1.1 0 .1-.1.1 0 0-.3.1-.4.6 0 .3-.1.5-.1.7-.1.4.2.6.3.6l.1.1c.6.5 1 1.2 1 1.9 0 .2-.1.3-.1.4-.3.6-.6 1.1-.9 1.6l-.2.2c-.4.2-.8.4-1.3.4-.3 0-.6-.1-.9-.2h-.1-.3c-.2 0-.4.1-.5.2-.2.2-.4.3-.6.5-.4.3-.3.6-.3.7v.2c.1.7-.1 1.4-.5 2-.1.1-.2.2-.3.2-.4.2-.9.4-1.6.6l-.1.1H15.1c-.8-.1-1.4-.6-1.8-1.3l-.1-.1c0-.1-.2-.4-.7-.4h-.7c-.6 0-.7.3-.7.3v.2c-.3.6-1 1.1-1.7 1.3H9zm5.5-2.2s.1.1.1.3c.1.1.2.2.4.3.4-.1.8-.3 1-.4.1-.2.1-.3 0-.5v-.2c-.1-.6 0-1.5.8-2.3l.4-.4.2-.2h.1c.4-.3.9-.6 1.5-.6.4 0 .7.1.8.1h.1c.1.1.2.1.4.1h.2c.2-.4.4-.7.5-1 0-.2-.2-.4-.3-.5h-.1c-.2-.2-1-1-.8-2.3.1-.3.1-.5.1-.7v-.1c.3-1.3 1.2-1.7 1.5-1.9l.1-.1c.2-.1.4-.2.5-.4l-.1-.3c0-.2-.1-.5-.1-.7-.1-.1-.3-.2-.5-.2h-.2c-.3 0-1.4-.1-2.1-1.2-.1-.2-.4-.7-.4-.7-.7-1.2-.2-2.2-.1-2.5l.1-.1c.1-.2.2-.4.1-.7l-.2-.2c-.2-.2-.4-.3-.6-.5-.2 0-.4.1-.6.2l-.1.1c0 .1-.1.1-.1.2-.2.2-.7.4-1.3.4-.2 0-.5 0-.9-.1l-.3-.1c-.2-.1-.3-.1-.4-.1-1.1-.4-1.6-1.2-1.7-1.8v-.2c0-.2-.1-.4-.3-.6h-1c-.1.1-.3.3-.3.5 0 .1 0 .2-.1.2-.1.3-.3 1.3-1.6 1.7.1.3-.1.4-.3.5h-.2c-.1.1-.4.1-.7.1-.8 0-1.3-.3-1.5-.5l-.2-.1c-.2-.2-.3-.2-.5-.2h-.1c-.2.1-.5.4-.8.6 0 .2 0 .4.1.6v.2c.3.5.5 1.5 0 2.4 0 .2-.1.3-.1.4l-.2.2C4 9.5 2.9 9.6 2.6 9.6h-.2c-.2 0-.4.1-.5.2v.2c0 .3-.1.5-.1.8 0 .2.2.4.4.4.1 0 .2.1.2.1.1 0 1.1.4 1.4 1.8v.1c0 .2.1.4.1.6.2 1.4-.6 2.2-.8 2.4l-.1.1c-.2.1-.3.3-.3.5l.1.3c.1.2.3.5.4.7h.2c.1 0 .2 0 .4-.1 0-.1.2-.1.3-.1 0 0 .3-.1.7-.1.5 0 1.1.2 1.5.5h.1l.1.1c.1.1.3.3.5.4l.1.1c.8.7.9 1.7.8 2.3 0 0 0 .2-.1.3 0 .1 0 .3.1.5.3.1.7.2 1 .4.2-.1.3-.2.4-.4l.1-.1c.3-.6 1-1.2 2.1-1.2h.8c1.1 0 1.9.6 2.2 1.2z"/><path d="M9 23.6h-.2c-.6-.2-1.2-.4-1.7-.6-.1 0-.2-.1-.2-.2-.4-.6-.6-1.3-.4-1.9v-.1c0-.4-.1-.7-.4-.9l-.6-.5c-.2-.2-.4-.2-.7-.2-.2 0-.3.1-.3.1h-.2c-.2.1-.5.2-.8.2-.4 0-.8-.1-1.1-.3-.1 0-.2-.1-.2-.2l-.9-1.5c0-.1-.1-.2-.1-.3 0-.7.3-1.4.9-1.8l.1-.1c.1-.1.3-.4.3-.9-.1-.2-.1-.5-.1-.7-.1-.6-.6-.8-.6-.8h-.1C1 12.5.4 12 .2 11.3V11c.1-.6.2-1.2.3-1.7 0-.1.1-.2.1-.3.4-.5 1.1-.8 1.7-.8h.2c.2 0 .6-.1.8-.5v-.1c.1-.2.2-.4.4-.6.2-.3.2-.7 0-1h.1c-.4-.7-.4-1.4-.2-2.1 0-.1.1-.2.1-.2.4-.4.8-.8 1.3-1.1.1-.1.2-.1.3-.1h.4c.6 0 1.1.2 1.5.6v.1l.1-.1s.2.2.6.2c.1 0 .3 0 .4-.1.3 0 .6-.1.8-.2.6-.2.6-.7.6-.7l.1-.1c.1-.7.5-1.3 1.2-1.7.1 0 .2-.1.3-.1h1.6c.1 0 .2 0 .2.1.7.3 1.1 1 1.2 1.7v.1s.1.5.7.7c.2.1.5.1.7.2.1.1.3.1.4.1.4 0 .6-.2.6-.2s.1-.1.2-.1c.4-.3.9-.6 1.5-.6.2 0 .3 0 .5.1.1 0 .2.1.2.1.4.3.8.6 1.3 1.1.1.1.1.2.1.2.3.7.2 1.4-.2 2.1 0 0 0 .1-.1.1 0 0-.3.4 0 1 .1.1.1.2.2.3.1.1.1.2.2.3.3.5.8.5.9.5h.1c.8 0 1.4.3 1.8.8 0 0 .1.1.1.2.2.5.3 1.1.3 1.8v.3c-.2.7-.8 1.2-1.4 1.4h-.2c-.1 0-.5.2-.6.8 0 .3-.1.5-.1.7-.1.6.3.8.3.9l.1.1c.6.5.9 1.1.9 1.8 0 .1 0 .2-.1.3-.3.6-.6 1.1-.9 1.5l-.2.2c-.4.2-.7.3-1.1.3-.3 0-.6-.1-.8-.2h-.1s-.1-.1-.3-.1c-.2 0-.5.1-.7.2-.2.1-.4.3-.6.5-.4.4-.4.8-.4.9v.2c.1.7-.1 1.3-.5 1.8-.1.1-.1.1-.3.2-.4.2-1 .4-1.6.6H15c-.7-.1-1.3-.6-1.6-1.2l-.1-.1c0-.1-.3-.5-.9-.5h-.7c-.7 0-.9.5-.9.5l-.2.1h.1c-.3.6-.9 1-1.6 1.2 0 .2-.1.2-.1.2zm3.3-3c1 0 1.7.6 2 1.1 0 0 .1.1.1.2.1.2.3.4.6.5.4-.1.8-.3 1.2-.4.1-.2.1-.5.1-.8l.1-.1h-.1c-.1-.6 0-1.4.8-2.1l.4-.4.2-.2h.1c.4-.4.9-.5 1.4-.5.4 0 .6.1.7.1h.1c.1.1.3.1.4.1.1 0 .3 0 .4-.1.3-.4.5-.8.6-1.1 0-.2-.2-.5-.4-.7V16l-.1.1c-.2-.2-.9-.9-.8-2.1.1-.3.1-.5.1-.7v-.1a2.1 2.1 0 011.4-1.7l.1-.1c.3-.1.5-.3.7-.5-.1-.4-.1-.8-.2-1.2-.2-.2-.4-.3-.7-.3h-.2c-.3 0-1.3-.1-1.9-1.1-.2-.2-.4-.7-.4-.7-.6-1.2-.2-2-.1-2.3l.1-.1c.2-.3.2-.6.1-.8-.3-.2-.6-.5-.9-.7-.3 0-.6.1-.8.3l-.1.1c0 .2-.5.5-1.2.5-.2 0-.5 0-.8-.1-.3-.1-.5-.2-.7-.2-1-.4-1.4-1.1-1.5-1.7l.1-.1h-.1c0-.3-.2-.6-.4-.7h-1.1c-.4 0-.6.3-.6.6 0 0 0 .1-.1.2 0 .2-.3 1.2-1.4 1.6-.3 0-.5.1-.7.2h-.1c-.2.1-.4.2-.7.2-.8 0-1.2-.4-1.5-.6h-.1c-.2-.2-.4-.3-.6-.3h-.2c-.3.2-.6.5-.9.7 0 .3 0 .6.2.8v.2H5c.3.5.4 1.4 0 2.2-.2.2-.2.3-.3.3 0 .1-.1.2-.2.3-.6 1.2-1.6 1.2-1.9 1.2h-.2c-.3 0-.5.1-.7.3-.1.4-.2.8-.2 1.2.1.2.4.4.6.5 0 0 .1 0 .2.1.2.1 1.1.5 1.4 1.7v.1c0 .2.1.4.1.7.2 1.3-.5 2-.8 2.2-.2.2-.4.4-.4.7.1.4.4.7.6 1.1h.3c.2 0 .3 0 .4-.1h.2c.1 0 .3-.1.7-.1.5 0 1 .2 1.5.5h.1c.1.1.3.3.5.4l.1.1c.7.6.9 1.5.8 2.1 0 0 0 .1-.1.2-.1.2 0 .5.1.8.4.1.8.3 1.2.4.2-.1.4-.3.5-.5l.1-.1c.3-.5 1-1.1 1.9-1.1h.8z"/><path d="M23.4 9.4c0-.1-.1-.1-.1-.2-.4-.5-1.1-.8-1.8-.8h-.1c-.1 0-.6-.1-.9-.6-.1-.2-.2-.4-.4-.6-.4-.6-.1-1.1-.1-1.2l.1-.1c.4-.6.4-1.3.2-2 0-.1-.1-.1-.1-.2-.4-.4-.8-.7-1.3-1-.1 0-.1-.1-.2-.1-.7-.1-1.4.1-1.9.5 0 0-.1 0-.1.1 0 0-.2.2-.7.2-.1 0-.3 0-.4-.1-.2-.1-.4-.2-.7-.2-.6-.3-.7-.8-.7-.8v-.1c-.1-.7-.5-1.3-1.1-1.6-.1 0-.1-.1-.2-.1h-1.6c-.1 0-.1 0-.2.1-.6.3-1 1-1.1 1.6v.1c0 .1-.1.6-.7.8-.4.1-.7.2-.9.2-.1.1-.3.1-.4.1-.4 0-.7-.2-.7-.2s-.1 0-.1-.1c-.5-.4-1.2-.7-1.9-.5-.1 0-.1 0-.2.1-.4.3-.9.6-1.2 1-.1.1-.1.2-.2.2-.3.7-.2 1.4.2 2 0 .1 0 .1.1.1 0 .1.3.5 0 1.1-.2.3-.4.5-.4.6-.4.6-.9.6-1 .6h-.1c-.7 0-1.3.3-1.8.8 0 .1-.1.2-.1.3-.2.5-.2 1.1-.3 1.6v.2c.2.6.7 1.1 1.4 1.3h.1s.6.1.7.8c0 .2.1.5.1.7.1.7-.3 1-.4 1 0 0-.1 0-.1.1-.5.4-.8 1-.8 1.7 0 .1 0 .1.1.2l.9 1.5c0 .1.1.1.2.2.6.3 1.3.4 1.9.1h.1s.1-.1.4-.1c.3 0 .5.1.7.3.2.1.4.3.5.4.5.4.4 1 .4 1v.1c-.1.6 0 1.3.4 1.8.1.1.1.1.2.1.5.3 1.1.5 1.7.6h.3c.6-.1 1.2-.5 1.5-1.1 0 0 0-.1.1-.1 0 0 .2-.5 1-.5h.7c.7 0 .9.5 1 .5 0 0 0 .1.1.1.3.6.9 1 1.5 1.1h.1s.1 0 .1-.1c.6-.2 1.2-.4 1.7-.6.1 0 .1-.1.2-.1.4-.5.6-1.1.4-1.8v-.2c0-.2 0-.6.4-1 .2-.1.4-.3.5-.4.2-.2.4-.3.7-.3.2 0 .4.1.4.1h.1c.2.1.5.1.8.1.4 0 .7-.1 1.1-.3l.2-.2c.4-.5.7-1 .9-1.5 0-.1.1-.1.1-.2 0-.7-.3-1.3-.8-1.7l-.1-.1s-.4-.3-.4-.9c.1-.2.1-.4.1-.7.1-.7.6-.9.7-.9h.1c.6-.2 1.1-.7 1.4-1.3v-.2c-.1-.2-.1-.8-.3-1.3zm-1.6 2.1c-.1 0-.1 0-.1.1-.4.2-1.1.7-1.3 1.6v.1c0 .2-.1.5-.1.7-.1 1 .3 1.7.7 2l.1.1c.2.2.4.5.4.8-.2.4-.4.8-.7 1.1-.1.1-.3.1-.4.1-.1 0-.3 0-.4-.1h-.1c-.1-.1-.4-.1-.7-.1-.5 0-1 .2-1.4.5-.2.1-.3.3-.5.4-.7.7-.8 1.5-.7 2v.1c.1.3 0 .6-.1.9-.4.2-.8.3-1.3.4-.3-.1-.5-.3-.7-.6 0-.1 0-.1-.1-.1-.2-.4-.9-1-1.9-1h-.7c-1 0-1.6.6-1.9 1 0 .1 0 .1-.1.1-.1.3-.4.5-.7.6-.4-.1-.8-.3-1.3-.4-.1-.3-.2-.6-.1-.9v-.1c.1-.5 0-1.3-.7-2-.2-.1-.4-.3-.5-.4h-.1c-.4-.3-.9-.5-1.4-.5-.3 0-.5.1-.7.1h-.1c-.3.1-.6.1-.9 0-.2-.4-.4-.7-.7-1.1 0-.3.2-.6.4-.8l.1-.1c.4-.3.9-1 .7-2-.1-.2-.1-.4-.1-.7v-.1c-.2-1-.9-1.5-1.3-1.6l-.1-.1c-.3-.1-.6-.3-.7-.6 0-.4.1-.8.2-1.2.2-.2.5-.4.9-.3h.1c.3 0 1.2-.1 1.8-1.1v-.1c0-.2.1-.4.2-.6.5-.9.3-1.7 0-2.1 0-.1 0-.1-.1-.1-.1-.4-.1-.7 0-1 .3-.3.6-.6.9-.8.3-.1.7.1.9.3.1 0 .1.1.1.1.2.2.7.5 1.4.5.3 0 .5 0 .7-.1.3-.2.5-.2.7-.3 1-.4 1.3-1.1 1.4-1.6v-.1c0-.3.2-.6.5-.8h1.2c.4.1.5.4.6.8v.1c.1.5.5 1.3 1.4 1.6.2.1.4.1.7.2.2.1.5.1.7.1.7 0 1.1-.3 1.2-.5.1 0 .1-.1.1-.1.2-.2.6-.3.9-.3.3.2.6.5.9.8.1.3 0 .7-.1.9 0 .1 0 .1-.1.1-.2.4-.4 1.2 0 2.1.1.2.2.4.4.6.6 1 1.5 1.1 1.8 1.1h.1c.3 0 .6.1.9.3.1.4.1.8.2 1.2.1.6-.1.8-.4.9z"/></g></svg>`,
        user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="sr-icon"><path d="M12 11.2c2.7 0 4.9-2.1 4.9-4.8V4.8C16.8 2.1 14.7 0 12 0S7.2 2.1 7.2 4.8v1.6c0 2.7 2.1 4.8 4.8 4.8zM8.9 4.8c0-1.7 1.4-3.1 3.1-3.1 1.7 0 3.1 1.4 3.1 3.1v1.6c0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1V4.8zM17.9 12.3c-.3-.2-.8-.1-1 .2l-.2.3c-.2.3-.1.7.2.9 1.3 1 2 2.5 2 4.1v4.5H5v-4.5c0-1.6.8-3.1 2-4.1.3-.2.3-.6.2-.9l-.2-.3c-.2-.4-.6-.5-1-.2-1.7 1.3-2.7 3.3-2.7 5.4v4.9c0 .8.7 1.4 1.4 1.4h14.6c.7 0 1.3-.6 1.3-1.4v-4.9c.1-2.1-1-4.1-2.7-5.4z"/></g></svg>`,
        help: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="sr-icon"><path d="M9.5 22.2c0-.5.3-.8.8-.8h1c.5 0 .8.3.8.8v1c0 .5-.3.8-.8.8h-1c-.5 0-.8-.3-.8-.8v-1zM9.6 17v-.8c0-5.1 5.9-5.8 5.9-10.2 0-2.1-1.8-3.9-4.4-3.9-1.5 0-2.7.6-3.4 1-.4.3-.9.3-1.1-.2l-.3-.4c-.3-.4-.3-.8.2-1.1C7.3.9 9 0 11.2 0c3.8 0 6.7 2.4 6.7 5.9 0 5.5-5.9 6-6 10.4v.8c0 .5-.3.7-.8.7h-.6c-.6 0-.9-.3-.9-.8z"/></g></svg>`,
    }
};
