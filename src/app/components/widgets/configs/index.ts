import {CHARTS} from './charts';
import {COUNTERS} from './counters';
import {INFO_SHORTCUTS} from './infoShortcuts';
import {SHORTCUT_LISTS} from './shortcutLists';
import {SHORTCUTS} from './shortcuts';
import {MISC_WIDGETS} from './misc';

export const WIDGET_CONFIGS = [
    ...CHARTS,
    ...COUNTERS,
    ...INFO_SHORTCUTS,
    ...SHORTCUT_LISTS,
    ...SHORTCUTS,
    ...MISC_WIDGETS
];

export * from './charts';
export * from './counters';
export * from './infoShortcuts';
export * from './shortcutLists';
export * from './shortcuts';
export * from './misc';


