import {Component} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {Project, ProjectTask} from '@uni-entities';
import {ProjectService} from '@app/services/services';
import {
    UniTableConfig,
    UniTableColumn,
    UniTableColumnType
} from '@uni-framework/ui/unitable';

@Component({
    selector: 'project-task',
    templateUrl: 'tasks.html'
})
export class ProjectTasks {
    tableConfig: UniTableConfig;
    project: Project;
    projectTasks: ProjectTask[];

    onDestroy$: Subject<any> = new Subject();

    constructor(private projectService: ProjectService) {}

    ngOnInit() {
        this.tableConfig = this.getTableConfig();

        this.projectService.currentProject.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(project => {
            if (project && project.ID >= 0) {
                this.project = project;
                this.projectTasks = project.ProjectTasks || [];
            }
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    onTasksChange() {
        this.project.ProjectTasks = this.projectTasks.filter(t => !t['_isEmpty']);
        this.projectService.isDirty = true;
    }

    private getTableConfig(): UniTableConfig {
        return new UniTableConfig('sales.project.tasks', true)
            .setDeleteButton(true)
            .setColumns([
                new UniTableColumn('Number', 'Nr'),
                new UniTableColumn('Name', 'Oppgave'),
                new UniTableColumn('Description', 'Beskrivelse'),
                new UniTableColumn('StartDate', 'Startdato', UniTableColumnType.LocalDate),
                new UniTableColumn('EndDate', 'Sluttdato', UniTableColumnType.LocalDate),
                new UniTableColumn('CostPrice', 'Kostpris', UniTableColumnType.Money),
                new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number),
                new UniTableColumn('Price', 'Pris', UniTableColumnType.Money),
                new UniTableColumn('Total', 'Total', UniTableColumnType.Money, false)
            ])
            .setChangeCallback(event => {
                const task = event.rowModel;
                if (!task.ID && !task['_createguid']) {
                    task['_createguid'] = this.projectService.getNewGuid();
                }

                if (!task.ProjectID) {
                    task.ProjectID = this.project.ID;
                }

                if (event.field === 'Amount' || event.field === 'Price') {
                    task.Total = (task.Amount || 0) * (task.Price || 0);
                }

                return task;
            });
    }
}
