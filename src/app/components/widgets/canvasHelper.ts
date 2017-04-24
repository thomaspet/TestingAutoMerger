import {IUniWidget, IWidgetLayout} from './widgetCanvas';

export class CanvasHelper {
    public canvasGrid: boolean[][];
    private numColumns: number;
    private numRows: number;

    public getLayout(name: string): IWidgetLayout {
        if (!name || !name.length) {
            return;
        }

        try {
            const layoutStore = JSON.parse(localStorage.getItem('uni_widget_layouts'));
            if (layoutStore[name]) {
                return layoutStore[name];
            }
        } catch (e) {}
    }

    public saveLayout(name: string, layout: IWidgetLayout) {
        if (!name || !name.length) {
            return;
        }

        let layoutStore;
        try {
            layoutStore = JSON.parse(localStorage.getItem('uni_widget_layouts'));
        } catch (e) {}

        if (!layoutStore) {
            layoutStore = {};
        }

        layout['_editMode'] = false;
        layoutStore[name] = layout;
        localStorage.setItem('uni_widget_layouts', JSON.stringify(layoutStore));
    }

    public removeLayout(name: string) {
        if (!name || !name.length) {
            return;
        }

        try {
            const layoutStore = JSON.parse(localStorage.getItem('uni_widget_layouts'));
            delete layoutStore[name];
            localStorage.setItem('uni_widget_layouts', JSON.stringify(layoutStore));
        } catch (e) {}
    }

    public resetGrid(numColumns?: number): void {
        this.numColumns = numColumns || this.numColumns;
        this.numRows = Math.ceil(9 * (12 / this.numColumns));

        this.canvasGrid = [];
        for (let y = 0; y < this.numRows; y++) {
            let row = [];
            for (let x = 0; x < this.numColumns; x++) {
                row.push(false);
            }

            this.canvasGrid.push(row);
        }
    }

    public activateLayout(widgets: IUniWidget[], targetCols) {
        this.resetGrid(targetCols);
        let overflow: IUniWidget[] = [];

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
                w.x = position.x;
                w.y = position.y;
                this.reserveGridSpace(w);
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
        for (let y = widget.y; y < widget.y + widget.height; y++) {
            for (let x = widget.x; x < widget.x + widget.width; x++) {
                this.canvasGrid[y][x] = true;
            }
        }
    }

    public releaseGridSpace(widget: IUniWidget) {
        for (let y = widget.y; y < widget.y + widget.height; y++) {
            for (let x = widget.x; x < widget.x + widget.width; x++) {
                this.canvasGrid[y][x] = false;
            }
        }
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

    public getMockWidget(widgetName: string) {
        let mockWidgets: any = {
            notification: {
                width: 1,
                height: 1,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'Varsler',
                    description: 'Trenger tilsyn',
                    icon: 'bell',
                    link: '/sales/quotes',
                    amount: 90,
                    backgroundColor: '#dc9346'
                }
            },

            rss: {
                width: 4,
                height: 4,
                widgetType: 'rss', // TODO: enum
                config: {
                    header: 'Nyheter fra kundesenteret',
                    description: 'Trenger tilsyn',
                    icon: 'bell',
                    link: '/sales/quotes',
                    amount: 90,
                    backgroundColor: '#dc9346'
                }
            },

            shortcut: {
                width: 1,
                height: 1,
                widgetType: 'shortcut', // TODO: enum
                config: {
                    label: 'Tilbud',
                    description: 'Tilbudsoversikt',
                    icon: 'paperclip',
                    link: '/sales/quotes'
                }
            },

            chart: {
                width: 4,
                height: 3,
                widgetType: 'chart',
                config: {
                    header: 'Ansatte per avdeling',
                    chartType: 'pie',
                    labels: ['Utvikling', 'Salg', 'Konsulent', 'Kundeservice', 'Teknisk', 'Administrasjon'],
                    dataset: [
                        {
                            data: [22, 8, 6, 16, 4, 10],
                            backgroundColor: ['#7293cb', '#6b4c9a', '#e1974c', '#84ba5b', '#ff0000', '#ffff00'],
                            label: 'Ansatte',
                            borderColor: '#fff',
                        }
                    ],
                    options: {
                        cutoutPercentage: 85,
                        animation: {
                            animateScale: true
                        },
                        legend: {
                            position: 'left'
                        }
                    },
                    title: 'Driftsresultat',
                    drilldown: false,
                    chartID: 487515
                }
            }
        };

        return JSON.parse(JSON.stringify(mockWidgets[widgetName]));
    }

}
