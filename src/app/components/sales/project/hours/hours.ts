import { Component, ViewChild } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { WorkEditor } from '../../../timetracking/components/workeditor';
import {
    ProjectService,
    ErrorService
} from '../../../../services/services';
import {
    UniTable,
    UniTableConfig,
    UniTableColumn,
    UniTableColumnType
} from '../../../../../framework/ui/unitable/index';
import * as moment from 'moment';

@Component({
    selector: 'project-hours',
    templateUrl: './hours.html',
    providers: [WorkEditor]
})

export class ProjectHours {

    @ViewChild(UniTable) public table: UniTable;
    private tableConfig: UniTableConfig;
    private currentProjectID: number;
    private filter: string = '';
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(
        private projectService: ProjectService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private worker: WorkEditor) {

        this.route.queryParams.subscribe((params) => {
            this.currentProjectID = +params['projectID'];
            this.filter = 'Dimensions.ProjectID eq ' + this.currentProjectID;
            if (params && params['projectID']) {
                if (params['month'] && params['year']) {
                    let fromDate = new Date(params['year'], params['month'] - 1, 1);
                    this.filter += " and ( date ge '" + moment(fromDate).format().slice(0, 10)
                        + "' and date le '" + moment(fromDate).endOf('months').format().slice(0, 10) + "' )";
                } 
                this.tableConfig = this.getTableConfig();
            }
        });
    }

    private getTableConfig(): UniTableConfig {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();

            return this.projectService.getAllProjectHours(this.filter)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        return new UniTableConfig(false, true, 15)
            .setDeleteButton(false)
            .setColumns([
                new UniTableColumn('Date', 'Dato', UniTableColumnType.DateTime),
                this.getHourTableColumn('StartTime', 'Start'),
                this.getHourTableColumn('EndTime', 'Slutt'),
                this.worker.createLookupColumn('Worktype', 'Timeart', 'Worktype', x => this.worker.lookupType(x)),
                new UniTableColumn('LunchInMinutes', 'Lunsj', UniTableColumnType.Number)
                    .setAlignment('center')
                    .setWidth('5rem'),
                this.worker.createHourColumn('Minutes', 'Timer')
                    .setWidth('5rem').setAlignment('center').setCls('ctoa'),
                new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text),
                new UniTableColumn('WorkRelation.Worker.Info.Name', 'Navn', UniTableColumnType.Text),
                this.worker.createLookupColumn('Dimensions.ProjectID', 'Prosjekt',
                    'Dimensions.Project', x => this.worker.lookupAny(x, 'projects', 'projectnumber'), 'ProjectNumber')
                    .setWidth('6rem'),
                this.worker.createLookupColumn('CustomerOrder', 'Ordre',
                    'CustomerOrder',
                    x => this.worker.lookupAny(x, 'orders', 'ordernumber', 'customername'),
                    'OrderNumber', 'CustomerName')
            ]);
    }

    private getHourTableColumn(fieldName: string, name: string) {
        return new UniTableColumn(fieldName, name).setTemplate(
            (item) => {
                return moment(new Date(item[fieldName])).format('HH:mm');
            }).setWidth('5rem');
    }
}