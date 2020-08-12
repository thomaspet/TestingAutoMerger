import {THEMES} from 'src/themes/theme';

export enum WidgetCategory {
    MISC,
    CHART,
    COUNTER
}

export enum WidgetModule {
    ACCOUNTING,
    SALES,
    SALARY,
    BANK,
    TIMETRACKING,
    MISC
}

export interface WidgetDefinition {
    name: string;
    label: string;
    category: WidgetCategory;
    module: WidgetModule;
    size: 'small' | 'large';
    component;
    options?;
    onlyForTheme?: THEMES;
    routePermissions?: string[];
    uiFeaturePermissions?: string[];
}
