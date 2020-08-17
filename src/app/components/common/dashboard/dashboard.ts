import {Component, ChangeDetectorRef, ChangeDetectionStrategy, Input} from '@angular/core';
import * as Muuri from 'muuri';
import {WidgetDefinition} from './models';
import {WIDGET_DEFINITIONS} from './widgets';

import * as Chart from 'chart.js';
import './rounded-bar-chart';
import {UniModalService} from '@uni-framework/uni-modal';
import {WidgetSelectorDialog} from './widget-selector-dialog/widget-selector-dialog';
import {DashboardDataService} from './dashboard-data.service';
import {Subscription} from 'rxjs';
import {UserDto} from '@uni-entities';
import {AuthService} from '@app/authService';
import {cloneDeep} from 'lodash';

export interface DashboardConfig {
    storageKey: string;
    header: string;
    layout: string[] | ((user?: UserDto) => string[]);
}

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardNew {
    @Input() config: DashboardConfig;

    gridInstance: Muuri;
    refreshInterval: Subscription;

    defaultLayout: string[];

    currentLayout: string[];
    layoutBackup: string[];

    widgetDefinitions: WidgetDefinition[];
    editMode = false;

    onDragEnd = () => {
        try {
            const layout: string[] = this.gridInstance.getItems().map(item => {
                return item.getElement().getAttribute('data-id');
            });

            this.currentLayout = layout;
            this.widgetDefinitions = this.widgetDefinitions.map(widgetDef => {
                widgetDef['_index'] = layout.findIndex(widgetName => widgetName === widgetDef.name);
                return widgetDef;
            });

            this.cdr.markForCheck();
        } catch (e) {
            console.error(e);
        }
    }

    constructor(
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private modalService: UniModalService,
        private dataService: DashboardDataService,
    ) {
        const style = getComputedStyle(document.body);
        const font = style.getPropertyValue('--font-family');
        Chart.defaults.global.defaultFontFamily = font;
        Chart.defaults.global.maintainAspectRatio = false;

        // Clear dataService cache on init. This means the dashboard will always
        // show "fresh" data, but the service cache still helps avoid too many requests
        // when editing (adding/removing widgets), changing filters etc.
        this.dataService.invalidateCache();

        // TODO: Redraw the dashboard every 5 minutes
        // this.refreshInterval = interval(300000).subscribe(() => {
        //     this.dataService.invalidateCache();
        //     // TODO: redraw widgets
        // });
    }

    ngOnChanges() {
        if (this.config) {
            this.defaultLayout = typeof this.config.layout === 'function'
                ? this.config.layout(this.authService.currentUser)
                : this.config.layout;

            this.currentLayout = this.getSavedLayout() || this.defaultLayout;
            // debugger;
            this.initGrid();
        }
    }

    // ngAfterViewInit() {
    //     setTimeout(() => {
    //         this.currentLayout = this.getSavedLayout() || this.defaultLayout;
    //         this.initGrid();
    //     });
    // }

    ngOnDestroy() {
        this.refreshInterval?.unsubscribe();

        try {
            this.gridInstance.off('dragReleaseEnd', this.onDragEnd);
            this.gridInstance.destroy(true);
        } catch (e) {
            console.error(e);
        }
    }

    initGrid() {
        if (this.gridInstance) {
            this.gridInstance.destroy();
        }

        this.widgetDefinitions = this.getWidgetDefinitions(this.currentLayout);
        this.cdr.markForCheck();
        setTimeout(() => {
            this.gridInstance = new Muuri('#widget-grid', {
                dragEnabled: this.editMode,
                layout: {
                    rounding: false,
                    fillGaps: true
                },
            });

            this.gridInstance.refreshItems().layout();
            this.gridInstance.on('dragReleaseEnd', this.onDragEnd);
        });
    }

    startEdit() {
        this.layoutBackup = [...this.currentLayout];
        this.editMode = true;
        this.initGrid();
    }

    stopEdit() {
        this.editMode = false;
        this.initGrid();
    }

    saveLayoutChanges() {
        const isDefaultLayout = this.currentLayout?.length === this.defaultLayout?.length
            && this.currentLayout.every((item, index) => item === this.defaultLayout[index]);

        if (isDefaultLayout) {
            /*
                If the user tries saving a layout that is identical to the default,
                we should just reset and remove any localStorage data.
                This way the user will get updates we might make to the default later.
            */
            this.resetToDefaultLayout();
        } else {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.currentLayout));
        }

        this.stopEdit();
    }

    discardLayoutChanges() {
        this.currentLayout = this.layoutBackup;
        this.stopEdit();
    }

    resetToDefaultLayout() {
        localStorage.removeItem(this.config.storageKey);
        this.currentLayout = this.defaultLayout;
        this.stopEdit();
    }

    removeWidget(index: number) {
        const item = this.gridInstance.getItems(index);

        this.currentLayout.splice(index, 1);
        this.widgetDefinitions.splice(index, 1);
        this.gridInstance.remove(item, { removeElements: true });
        this.cdr.markForCheck();
    }

    private getWidgetDefinitions(layout: string[]) {
        return layout.map((widgetName, index) => {
            const widgetDef = cloneDeep(WIDGET_DEFINITIONS.find(def => def.name === widgetName));
            widgetDef['_index'] = index;
            return widgetDef;
        }).filter(widgetDef => {
            return !!widgetDef && this.dataService.canShowWidget(widgetDef);
        });
    }

    private getSavedLayout() {
        try {
            const savedLayout = localStorage.getItem(this.config.storageKey);
            if (savedLayout) {
                return JSON.parse(savedLayout);
            }
        } catch (e) {
            console.error(e);
        }
    }

    openWidgetSelector() {
        this.modalService.open(WidgetSelectorDialog, {
            data: this.widgetDefinitions
        }).onClose.subscribe(layout => {
            if (layout) {
                this.currentLayout = layout;
                this.initGrid();
            }
        });
    }
}
