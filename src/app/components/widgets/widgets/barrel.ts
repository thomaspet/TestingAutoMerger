import {UniShortcutWidget} from './shortcut';
import {UniNotificationWidget} from './notification';
import {UniChartWidget} from './chart';
import {UniRSSWidget} from './rss';
import { UniListWidget } from './list';
import { UniClockWidget } from './clock';
import { UniCompanyLogoWidget } from './companyLogo';
import { UniOverdueInvoiceWidget } from './overdueInvoice'
import { UniKPIWidget } from './kpi';
import { UniFlexWidget } from './flex';

export const UNI_WIDGETS = [
    UniShortcutWidget,
    UniNotificationWidget,
    UniChartWidget,
    UniRSSWidget,
    UniListWidget,
    UniClockWidget,
    UniCompanyLogoWidget,
    UniOverdueInvoiceWidget,
    UniKPIWidget,
    UniFlexWidget
];

export * from './shortcut';
export * from './notification';
export * from './chart';
export * from './rss';
export * from './list';
export * from './clock';
export * from './kpi';
export * from './companyLogo';
export * from './overdueInvoice';
export * from './flex';
