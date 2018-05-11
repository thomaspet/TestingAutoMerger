import {UniChartWidget} from './chart';
import {UniRSSWidget} from './rss';
import {UniClockWidget} from './clock';
import {UniCompanyLogoWidget} from './companyLogo';
import {UniSumWidget} from './sumWidget';
import {UniFlexWidget} from './flex';
import {UniTransactionsWidget} from './transactions';
import {UniShortcutListWidget} from './shortcutList';
import {UniInfoShortcutWidget} from './infoShortcut';
import {UniCurrencyWidget} from './currency';
import {UniTopTenWidget} from './topten';
import {UniIntegrationCounterWidget} from './integrationCounter';

import {UniCountersWidget} from './counters';
import {UniShortcutWidget} from './shortcuts';
import {UniKpiWidget} from './kpi-widget';

export const UNI_WIDGETS = [
    UniCountersWidget,
    UniKpiWidget,
    UniShortcutWidget,
    UniChartWidget,
    UniRSSWidget,
    UniClockWidget,
    UniCompanyLogoWidget,
    UniSumWidget,
    UniFlexWidget,
    UniTransactionsWidget,
    UniShortcutListWidget,
    UniInfoShortcutWidget,
    UniCurrencyWidget,
    UniTopTenWidget,
    UniIntegrationCounterWidget,
];

export * from './counters';
export * from './kpi-widget';
export * from './shortcuts';
export * from './chart';
export * from './rss';
export * from './clock';
export * from './companyLogo';
export * from './sumWidget';
export * from './flex';
export * from './transactions';
export * from './shortcutList';
export * from './infoShortcut';
export * from './currency';
export * from './topten';
export * from './integrationCounter';

