import {UniShortcutWidget} from './shortcut';
import {UniCounterWidget} from './counter';
import {UniChartWidget} from './chart';
import {UniRSSWidget} from './rss';
import {UniClockWidget} from './clock';
import {UniCompanyLogoWidget} from './companyLogo';
import {UniOverdueInvoiceWidget} from './overdueInvoice';
import {UniKPIWidget} from './kpi';
import {UniFlexWidget} from './flex';

export const UNI_WIDGETS = [
    UniShortcutWidget,
    UniCounterWidget,
    UniChartWidget,
    UniRSSWidget,
    UniClockWidget,
    UniCompanyLogoWidget,
    UniOverdueInvoiceWidget,
    UniKPIWidget,
    UniFlexWidget
];

export * from './shortcut';
export * from './counter';
export * from './chart';
export * from './rss';
export * from './clock';
export * from './kpi';
export * from './companyLogo';
export * from './overdueInvoice';
export * from './flex';
