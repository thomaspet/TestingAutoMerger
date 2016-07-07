import {Component, Input} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {Router} from '@angular/router-deprecated';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';

export interface IViewConfig {
    labels?: {
        single: string;
        plural: string;
        createNew: string;
    }
    moduleID: number,
    detail: {
        route?: string;
        routeBackToList?: string;
    }
    tab: View;
    data: {
        route: string;
        model?: string;
        lookupFunction?: (any) => {},
        factory?: () => {}
        check?: (item:any) => void
    };
    tableConfig?: UniTableConfig;
    formFields?: Array<any>;
}

@Component({    
    selector: 'genericlist',
    templateUrl: 'app/components/timetracking/genericview/list.html',
    directives: [UniTable]
})
export class GenericListView {    
    @Input() viewconfig:IViewConfig;
    label: string;

    private lookupFunction: (any) => {};

    constructor(private tabService: TabService, private router:Router, private toastService:ToastService) {
    }

    ngOnInit() {
        if (this.viewconfig) {
            this.label = this.viewconfig.tab.label;
            this.lookupFunction = this.viewconfig.data.lookupFunction;
            var tab = this.viewconfig.tab;
            this.tabService.addTab({ name: tab.label, url: tab.url, moduleID: this.viewconfig.moduleID, active: true });
        }
    }

    public createNew() {
        this.router.navigateByUrl(this.viewconfig.detail.route + '0');
    }

    public onRowSelected(event) {
        this.router.navigateByUrl(this.viewconfig.detail.route + event.rowModel.ID);
    };        

}
