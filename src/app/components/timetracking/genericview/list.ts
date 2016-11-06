import {Component, Input} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {UniTableConfig} from 'unitable-ng2/main';
import {Router} from '@angular/router';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {WorkerService} from '../../../services/timetracking/workerservice';


export interface IViewConfig {
    labels?: {
        single: string;
        plural: string;
        createNew: string;
    };
    moduleID: UniModules;
    detail: {
        route?: string;
        routeBackToList?: string;
        nameProperty?: string;
    };
    tab: View | { label: string, url: string };
    data: {
        route: string;
        model?: string;
        expand?: string;
        factory?: () => {}
        check?: (item: any) => void
    };
    tableConfig?: UniTableConfig;
    formFields?: Array<any>;
}

@Component({
    selector: 'genericlist',
    templateUrl: 'app/components/timetracking/genericview/list.html'
})
export class GenericListView {
    @Input() public viewconfig: IViewConfig;
    public label: string;

    private lookupFunction: (value: any) => {};

    constructor(private tabService: TabService, private router: Router, private toastService: ToastService, private workerService: WorkerService) {
    }

    public ngOnInit() {
        if (this.viewconfig) {
            this.label = this.viewconfig.tab.label;
            this.lookupFunction = (urlParams) => {
                return this.workerService.queryWithUrlParams(urlParams, this.viewconfig.data.route, this.viewconfig.data.expand);
            };
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
