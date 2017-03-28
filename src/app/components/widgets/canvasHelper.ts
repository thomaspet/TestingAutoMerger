import {IUniWidget} from './uniWidget';

export class CanvasHelper {
    public canvasGrid: boolean[][];

    constructor() {
        this.canvasGrid = [];
        for (let y = 0; y < 9; y++) {
            let row = [];
            for (let x = 0; x < 12; x++) {
                row.push(false);
            }
            this.canvasGrid.push(row);
        }
    }

    public getClosestGridIndex(canvas: HTMLElement, top: number, left: number): {x: number, y: number} {
        const cellWidth = canvas.clientWidth  / 12;
        const cellHeight = canvas.clientHeight / 9;

        return {
            x: Math.floor((left + cellWidth / 4) / cellWidth),
            y: Math.floor((top + cellHeight / 4) / cellHeight)
        };
    }

    public getAbsolutePosition(canvas: HTMLElement, y: number, x: number): {top: number, left: number} {
        return {
            top: (canvas.clientHeight / 9) * y,
            left: (canvas.clientWidth / 12) * x
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
        for (let rowIndex = 0; rowIndex <= 9 - (widget.height); rowIndex++) {
            for (let cellIndex = 0; cellIndex <= (12 - widget.width); cellIndex++) {
                if (!this.canvasGrid[rowIndex][cellIndex]) {
                    const collision = this.checkForCollision(
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

    public checkForCollision(y: number, x: number, height: number, width: number): boolean {
        for (let rowIndex = y; (rowIndex < y + height); rowIndex++) {
            for (let cellIndex = x; (cellIndex < x + width); cellIndex++) {
                if (this.canvasGrid[rowIndex][cellIndex]) {
                    return true;
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
