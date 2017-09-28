import {SHORTCUTS} from './shortcuts';
import {CHARTS} from './charts';
import {COUNTERS} from './counters';

export const WIDGET_CONFIGS = {
    shortcuts: SHORTCUTS,
    counters: COUNTERS,
    charts: CHARTS,

    clock: {
        width: 3,
        height: 1,
        widgetType: 'clock',
        config: {
            dateColor: '#7698bd',
            showSeconds: true
        }
    },

    rss: {
        width: 4,
        height: 4,
        x: 8,
        y: 0,
        widgetType: 'rss',
        config: {
            header: 'Nyheter fra kundesenteret',
            dataEndpoint: '/api/biz/rss/1',
            RSSType: 1
            // DOCUMENTATION: https://unimicro.atlassian.net/wiki/pages/viewpage.action?spaceKey=UE&title=RssListe
        }
    },

    companyLogo: {
        width: 2,
        height: 1,
        widgetType: 'companyLogo',
        config: {}
    },
};
