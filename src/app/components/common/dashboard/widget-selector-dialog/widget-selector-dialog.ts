import {Component, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {WIDGET_DEFINITIONS} from '../widgets';
import {theme} from 'src/themes/theme';
import {cloneDeep} from 'lodash';
import {WidgetDefinition, WidgetModule} from '../models';
import {FeaturePermissionService} from '@app/featurePermissionService';
import {AuthService} from '@app/authService';
import {DashboardDataService} from '../dashboard-data.service';

@Component({
    selector: 'widget-selector-dialog',
    templateUrl: './widget-selector-dialog.html',
    styleUrls: ['./widget-selector-dialog.sass'],
})
export class WidgetSelectorDialog implements IUniModal {
    options: IModalOptions = {};
    onClose = new EventEmitter();

    availableWidgets: WidgetDefinition[];

    widgetGroups: { header: string; widgets: WidgetDefinition[] }[];

    constructor(private dashboardService: DashboardDataService) {}

    ngOnInit() {
        const activeWidgets: WidgetDefinition[] = this.options?.data || [];

        this.availableWidgets = cloneDeep(WIDGET_DEFINITIONS)
            .filter(widgetDef => this.dashboardService.canShowWidget(widgetDef))
            .map(widgetDef => {
                const originalIndex = activeWidgets.findIndex(w => w.name === widgetDef.name);
                if (originalIndex >= 0) {
                    widgetDef['_active'] = true;
                    widgetDef['_originalIndex'] = originalIndex;
                }

                return widgetDef;
            });

        this.widgetGroups = [
            { header: 'Diverse', widgets: this.getWidgetsByModule(WidgetModule.MISC) },
            { header: 'Regnskap', widgets: this.getWidgetsByModule(WidgetModule.ACCOUNTING) },
            { header: 'Salg', widgets: this.getWidgetsByModule(WidgetModule.SALES) },
            { header: 'Lønn', widgets: this.getWidgetsByModule(WidgetModule.SALARY) },
            { header: 'Bank', widgets: this.getWidgetsByModule(WidgetModule.BANK) },
            { header: 'Timeføring', widgets: this.getWidgetsByModule(WidgetModule.TIMETRACKING) },
        ].filter(group => group.widgets.length);
    }

    private getWidgetsByModule(module: WidgetModule) {
        return (this.availableWidgets || []).filter(w => w.module === module);
    }

    submit() {
        const selectedWidgets = [];

        this.widgetGroups.forEach(group => {
            selectedWidgets.push(...group.widgets.filter(w => w['_active']));
        });

        const layout = selectedWidgets.sort((a, b) => {
            // Sort the new list by the widget's old indexes (add new ones to the end)
            // to avoid overriding the user's ordering.

            const aIndex = a['_originalIndex'] >= 0 ? a['_originalIndex'] : 999;
            const bIndex = b['_originalIndex'] >= 0 ? b['_originalIndex'] : 999;

            return aIndex - bIndex;
        }).map(w => w.name);

        this.onClose.emit(layout);
    }
}
