import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {IUniWidget} from '../widgets/widgetCanvas';

@Component({
    selector: 'uni-accounting',
    template: `
        <uni-widget-canvas [defaultLayout]="widgetLayout"
                           [layoutName]="'accounting'">
        </uni-widget-canvas>
    `,
})
export class UniAccounting {
    public widgetLayout: IUniWidget[];

    constructor(tabService: TabService) {
        tabService.addTab({
             name: 'Regnskap',
             url: '/accounting',
             moduleID: UniModules.Accounting,
             active: true
        });

        this.widgetLayout = this.getDefaultLayout();
    }

    private getDefaultLayout(): any[] {
        return [
            {
                x: 0,
                y: 0,
                widgetID: 'shortcuts_accounting',
            },
            {
                x: 6,
                y: 0,
                widgetID: 'counters_supplierinvoice'
            },
            {
                x: 10,
                y: 0,
                widgetID: 'currency',
            },

            {
                x: 0,
                y: 1,
                widgetID: 'transaction_accounting',
            },
            {
                x: 8,
                y: 1,
                widgetID: 'shortcut_list_accounting',
            },
            {
                x: 10,
                y: 1,
                widgetID: 'info_shortcut_videos',
            },
        ];
    }

}
