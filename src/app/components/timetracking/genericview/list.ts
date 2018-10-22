import {Component, Input, OnInit} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTableConfig} from '../../../../framework/ui/unitable/index';
import {Router} from '@angular/router';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {WorkerService} from '../../../services/timetracking/workerService';
import {ErrorService} from '../../../services/services';
import {Observable} from 'rxjs';

export interface IViewConfig {
    labels?: {
        single?: string;
        plural?: string;
        createNew?: string;
        ask_delete?: string;
    };
    moduleID: UniModules;
    baseUrl: string;
    title?: string;
    titleProperty?: string;
    // tab: View | { label: string, url: string };
    data: {
        route: string;
        model?: string;
        expand?: string;
        factory?: () => {}
        check?: (item: any) => void
        checkObs?: (item: any) => Observable<any>
    };
    tableConfig?: UniTableConfig;
    formFields?: Array<any>;
}

@Component({
    selector: 'genericlist',
    templateUrl: './list.html'
})
export class GenericListView implements OnInit {
    @Input() public viewconfig: IViewConfig;

    public lookupFunction: (value: any) => {};
    public toolbarConfig: any = { title: '' };
    constructor(
        private tabService: TabService,
        private router: Router,
        private toastService: ToastService,
        private workerService: WorkerService,
        private errorService: ErrorService
    ) {
    }


    public ngOnInit() {
        if (this.viewconfig) {
            this.lookupFunction = (urlParams) => {
                return this.workerService.queryWithUrlParams(
                    urlParams, this.viewconfig.data.route, this.viewconfig.data.expand
                ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
            };

            console.log('adding tab: ' + this.viewconfig.baseUrl);
            this.tabService.addTab({
                name: this.viewconfig.title,
                url: this.viewconfig.baseUrl,
                moduleID: this.viewconfig.moduleID,
                active: true
            });

            this.toolbarConfig = { title: this.viewconfig.title };
        }
    }

    public createNew() {
        this.router.navigateByUrl(this.viewconfig.baseUrl + '/0');
    }

    public onRowSelected(event) {
        this.router.navigateByUrl(this.viewconfig.baseUrl + '/' + event.rowModel.ID);
    }

}
