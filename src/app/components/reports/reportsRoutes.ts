import {Overview} from "./overview/overview";

export const routes = [
    {
        path: '',
        redirectTo: 'overview'
    },
    {
        path: 'overview',
        //name: 'Overview',
        component: Overview
    }
];
