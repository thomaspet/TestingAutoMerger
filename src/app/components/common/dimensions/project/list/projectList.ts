import {Component} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Router} from '@angular/router';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {ProjectService} from '../../../../../services/common/ProjectService';
import {TabService, UniModules} from '../../../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'project-dimensions-list',
    templateUrl: 'app/components/common/dimensions/project/list/projectList.html'
})
export class ProjectList {

    private tableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(
        private router: Router,
        private projectService: ProjectService,
        private tabService: TabService) {
        this.tabService.addTab({ name: 'Prosjekter', url: '/dimensions/project', active: true, moduleID: UniModules.Projects });
        this.setupTable();
    }

    public createNew() {
        this.router.navigateByUrl('/dimensions/project/new');
    }

    public onRowSelected (event) {
        this.router.navigateByUrl('/dimensions/project/' + event.rowModel.ID);
    };

    private setupTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            return this.projectService.GetAllByUrlSearchParams(urlParams);
        };

        this.tableConfig = new UniTableConfig(false, true, 25)
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
