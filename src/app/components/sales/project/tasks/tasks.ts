import { Component, ViewChild, OnInit } from '@angular/core';
import { Project } from '../../../../unientities';
import { UniFieldLayout, FieldType } from '../../../../../framework/ui/uniform/index';
import { IUniSearchConfig } from '../../../../../framework/ui/unisearch/index';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
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


@Component({
    selector: 'project-task',
    templateUrl: 'tasks.html'
})

export class ProjectTasks implements OnInit {
    @ViewChild(UniTable)
    private table: UniTable;

    private projectLabel: string;
    private expandOptions: string[] = ['ProjectTasks.ProjectTaskSchedules'];
    public project: Project;
    private tableConfig: UniTableConfig;

    constructor(
        private projectService: ProjectService,
        private errorService: ErrorService) {}

    public ngOnInit() {
        this.tableConfig = this.getTableConfig();

        this.projectService.currentProject.subscribe(
            (project) => {
                if (project && project.ID >= 0) {
                    this.project = project;

                    // ternary that changes h2 title if the projectTasks
                    // array has any items in it
                    this.projectLabel = (this.project.ProjectTasks.length > 0)
                    ? `Rediger oppgave - ${project.Name}`
                    : `Ny oppgave - ${project.Name}`;
                }
            }
        );
    }

    private getTableConfig(): UniTableConfig {
        return new UniTableConfig(true, true, 15)
            .setDeleteButton(true)
            .setColumns([
                new UniTableColumn('Number', 'Nr'),
                new UniTableColumn('Name', 'Oppgave'),
                new UniTableColumn('Description', 'Beskrivelse'),
                new UniTableColumn('StartDate', 'Start Dato', UniTableColumnType.LocalDate),
                new UniTableColumn('EndDate', 'Slutt Dato', UniTableColumnType.LocalDate),
                new UniTableColumn('CostPrice', 'Kostpris', UniTableColumnType.Money),
                new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number),
                new UniTableColumn('Price', 'Pris', UniTableColumnType.Money),
                new UniTableColumn('Total', 'Total', UniTableColumnType.Money)
            ]);
    }

    public onRowChanged(event) {
        let row = event.rowModel;

        // Make sure new rows have a createguid
        if (!row.ID && !row._createguid) {
            row.ProjectID = this.project.ID;
            row._createguid = this.projectService.getNewGuid();
        }

        this.project.ProjectTasks[row._originalIndex] = row;
        this.projectService.currentProject.next(this.project);
        this.projectService.isDirty = true;
    }

    public onRowDeleted(event) {
        let row = event.rowModel;

        if (row.ID) {
            this.project.ProjectTasks[row._originalIndex].Deleted = true;
        } else {
            this.project.ProjectTasks.splice(row._originalIndex, 1);
        }

        this.projectService.currentProject.next(this.project);
        this.projectService.isDirty = true;
    }
}
