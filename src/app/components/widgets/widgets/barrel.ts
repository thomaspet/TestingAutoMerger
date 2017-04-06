import {UniShortcutWidget} from './shortcut';
import {UniNotificationWidget} from './notification';
import {UniChartWidget} from './chart';
import {UniRSSWidget} from './rss';
import { UniListWidget } from './list';
import { UniClockWidget } from './clock';

export const UNI_WIDGETS = [
    UniShortcutWidget,
    UniNotificationWidget,
    UniChartWidget,
    UniRSSWidget,
    UniListWidget,
    UniClockWidget
];

export * from './shortcut';
export * from './notification';
export * from './chart';
export * from './rss';
export * from './list';
export * from './clock';
