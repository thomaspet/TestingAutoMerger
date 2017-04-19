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

    lastTransactions: {
        width: 4,
        height: 3,
        x: 8,
        y: 1,
        widgetType: 'list',
        config: {
            header: 'Siste endringer',
            dataEndPoint: "/api/statistics?model=AuditLog&select=id,entitytype,entityid,field,User.displayname,createdat,updatedat&filter=field eq 'updatedby' and ( not contains(entitytype,'item') ) &join=auditlog.createdby eq user.globalidentity&top=10&orderby=id desc",
            listItemKeys: {
                username: 'UserDisplayName',
                module: 'AuditLogEntityType',
                action: 'AuditLogField',
                moduleID: 'AuditLogEntityID',
                time: 'AuditLogCreatedAt'
            }
        }
    },
};
