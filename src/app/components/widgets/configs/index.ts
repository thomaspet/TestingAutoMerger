import {CHARTS} from './charts';
import {COUNTERS} from './counters';
import {SHORTCUT_LISTS} from './shortcutLists';
import {MISC_WIDGETS} from './misc';

export const WIDGET_CONFIGS = [
    ...CHARTS,
    ...COUNTERS,
    ...SHORTCUT_LISTS,
    ...MISC_WIDGETS
];

export * from './charts';
export * from './counters';
export * from './shortcutLists';
export * from './misc';


