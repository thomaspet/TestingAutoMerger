import {Component} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Router} from '@angular/router';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../framework/ui/unitable/index';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ProjectService, ErrorService} from '../../../services/services';

@Component({
    selector: 'uni-project-lite',
    template: `
        <uni-toolbar [config]="{title: 'Prosjekter', omitFinalCrumb: true}"></uni-toolbar>
        <section class="application">
            <button class="new-button" (click)="createNew()">Nytt prosjekt</button>
            <uni-table
                [resource]="lookupFunction"
                [config]="tableConfig"
                (rowSelected)="onRowSelected($event)">
            </uni-table>
        </section>
    `
})

export class ProjectLite {

    private tableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(
        private router: Router,
        private projectService: ProjectService,
        private tabService: TabService,
        private errorService: ErrorService
    ) {
        this.tabService.addTab({
            name: 'Prosjekt LITE',
            url: '/dimensions/projectslite',
            active: true,
            moduleID: UniModules.Departments
        });

        this.setupTable();
    }

    public createNew() {
        this.router.navigateByUrl('/dimensions/projectslite/0');
    }

    public onRowSelected (event) {
        this.router.navigateByUrl('/dimensions/projectslite/' + event.rowModel.ID);
    };

    private setupTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            return this.projectService.GetAllByUrlSearchParams(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        this.tableConfig = new UniTableConfig('common.dimensions.department', false, true, 25)
            .setSearchable(true)
            .setColumns([
                new UniTableColumn('ProjectNumber', 'Prosjektnummer', UniTableColumnType.Text)
                    .setFilterOperator('contains'),
                new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
                    .setFilterOperator('contains'),
                new UniTableColumn('ProjectLeadName', 'Prosjektleder', UniTableColumnType.Text)
                    .setFilterOperator('contains'),
                new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                    .setFilterOperator('contains')
            ]);
    }
}