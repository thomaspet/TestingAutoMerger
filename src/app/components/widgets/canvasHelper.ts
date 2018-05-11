import {Injectable} from '@angular/core';
import {IResponsiveWidgetLayout, IWidgetReference} from './widgetCanvas';
import {IUniWidget, WIDGET_MAP} from './uniWidget';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {AuthService} from '@app/authService';

import {WIDGET_CONFIGS} from './configs';
import {UserDto} from '@uni-entities';

interface ISavedLayout {
    small: IWidgetReference[];
    medium: IWidgetReference[];
    large: IWidgetReference[];
}

@Injectable()
export class CanvasHelper {
    public canvasGrid: boolean[][];
    private numColumns: number;
    private numRows: number;

    constructor(
        private browserStorage: BrowserStorageService,
        private authService: AuthService
    ) {}

    public getWidgetsFromReferences(layout: IWidgetReference[]): IUniWidget[] {
        if (!layout || !layout.length) {
            return [];
        }

        const widgetConfigs: IUniWidget[] = WIDGET_CONFIGS || [];
        const widgets = [];
        layout.forEach(item => {
            const config = widgetConfigs.find(w => w.id === item.widgetID);
            if (config) {
                config.x = item.x;
                config.y = item.y;
                widgets.push(config);
            }
        });

        return widgets;
    }

    private getReferencesFromWidgets(widgets: IUniWidget[]): IWidgetReference[] {
        const layout = [];
        widgets.forEach(widget => {
            if (widget.id) {
                layout.push({
                    widgetID: widget.id,
                    x: widget.x,
                    y: widget.y
                });
            }
        });

        return layout;
    }

    public filterLayout(layout: IResponsiveWidgetLayout, user: UserDto): IResponsiveWidgetLayout {
        return {
            small: this.filterWidgetsByPermissions(layout.small, user),
            medium: this.filterWidgetsByPermissions(layout.medium, user),
            large: this.filterWidgetsByPermissions(layout.large, user),
        };
    }

    public filterWidgetsByPermissions(widgets: IUniWidget[], user: UserDto): IUniWidget[] {
        const filtered = widgets.filter(widget => {
            if (!widget.permissions || !widget.permissions.length) {
                return true;
            }

            return widget.permissions.every(requiredPermission => {
                return this.authService.hasUIPermission(user, requiredPermission);
            });
        });

        if (filtered.length !== widgets.length) {
            // Remove x/y coordinates so that the widget position is re-calculated
            // This prevents layouts with lots of holes after filtering widgets
            filtered.forEach(w => {
                w.x = undefined;
                w.y = undefined;
            });
        }

        return filtered;
    }

    public verifyCustomLayout(layout: ISavedLayout) {
        // Verify that all elements have a widgetID
        if (layout && layout.small && layout.medium && layout.large) {
            return layout.small.every(w => !!w.widgetID)
                && layout.medium.every(w => !!w.widgetID)
                && layout.large.every(w => !!w.widgetID);
        }

        return false;
    }

    public getSavedLayout(name: string): IResponsiveWidgetLayout {
        if (!name || !name.length) {
            return;
        }

        const layoutStore = this.browserStorage.getItemFromCompany('widget_layouts');
        if (layoutStore && layoutStore[name]) {
            const layout: ISavedLayout = layoutStore[name];
            if (this.verifyCustomLayout(layout)) {
                return {
                    small: this.getWidgetsFromReferences(layout.small),
                    medium: this.getWidgetsFromReferences(layout.medium),
                    large: this.getWidgetsFromReferences(layout.large)
                };
            } else {
                console.warn('Saved layout in did not pass verification in canvasHelper');
                this.removeLayout(name);
            }
        }
    }

    public saveLayout(name: string, layout: IResponsiveWidgetLayout) {
        if (!name || !name.length) {
            return;
        }

        let layoutStore = this.browserStorage.getItemFromCompany('uni_widget_layouts');
        if (!layoutStore) {
            layoutStore = {};
        }

        layoutStore[name] = {
            small: this.getReferencesFromWidgets(layout.small),
            medium: this.getReferencesFromWidgets(layout.medium),
            large: this.getReferencesFromWidgets(layout.large)
        };

        this.browserStorage.setItemOnCompany('uni_widget_layouts', layoutStore);
    }

    public removeLayout(name: string) {
        if (!name || !name.length) {
            return;
        }

        try {
            const layoutStore = this.browserStorage.getItemFromCompany('uni_widget_layouts');
            delete layoutStore[name];
            this.browserStorage.setItemOnCompany('uni_widget_layouts', layoutStore);
        } catch (e) {}
    }

    public resetGrid(numColumns?: number): void {
        this.numColumns = numColumns || this.numColumns;
        this.numRows = Math.ceil(9 * (12 / this.numColumns));

        this.canvasGrid = [];
        for (let y = 0; y < this.numRows; y++) {
            const row = [];
            for (let x = 0; x < this.numColumns; x++) {
                row.push(false);
            }

            this.canvasGrid.push(row);
        }
    }

    public activateLayout(widgets: IUniWidget[], targetCols) {
        this.resetGrid(targetCols);
        const overflow: IUniWidget[] = [];

        widgets.forEach((widget: IUniWidget) => {
            if (widget.x <= (targetCols - widget.width)) {
                this.reserveGridSpace(widget);
            } else {
                overflow.push(widget);
            }
        });

        if (overflow.length) {
            overflow.forEach((w: IUniWidget) => {
                const position = this.getNextAvailablePosition(w);
                if (position) {
                    w.x = position.x;
                    w.y = position.y;
                    this.reserveGridSpace(w);
                }
            });
        }
    }

    public getClosestGridIndex(unitInPx: number, top: number, left: number): {x: number, y: number} {
        return {
            x: Math.floor((left + unitInPx / 4) / unitInPx),
            y: Math.floor((top + unitInPx / 4) / unitInPx)
        };
    }

    public reserveGridSpace(widget: IUniWidget) {
        try {
            for (let y = widget.y; y < widget.y + widget.height; y++) {
                for (let x = widget.x; x < widget.x + widget.width; x++) {
                    this.canvasGrid[y][x] = true;
                }
            }
        } catch (e) {}
    }

    public releaseGridSpace(widget: IUniWidget) {
        try {
            for (let y = widget.y; y < widget.y + widget.height; y++) {
                for (let x = widget.x; x < widget.x + widget.width; x++) {
                    this.canvasGrid[y][x] = false;
                }
            }
        } catch (e) {}
    }

    public getNextAvailablePosition(widget: IUniWidget): {x: number, y: number} {
        for (let rowIndex = 0; rowIndex <= this.numRows - (widget.height); rowIndex++) {
            for (let cellIndex = 0; cellIndex <= (this.numColumns - widget.width); cellIndex++) {
                if (!this.canvasGrid[rowIndex][cellIndex]) {
                    const collision = this.findCollision(
                        rowIndex,
                        cellIndex,
                        widget.height,
                        widget.width
                    );

                    if (!collision) {
                        return {
                            y: rowIndex,
                            x: cellIndex
                        };
                    }
                }
            }
        }
    }

    public findCollision(y: number, x: number, height: number, width: number): {x: number, y: number} {
        for (let rowIndex = y; (rowIndex < y + height); rowIndex++) {
            for (let cellIndex = x; (cellIndex < x + width); cellIndex++) {
                if (this.canvasGrid[rowIndex][cellIndex]) {
                    return {
                        y: rowIndex,
                        x: cellIndex
                    };
                }
            }
        }
    }
}
