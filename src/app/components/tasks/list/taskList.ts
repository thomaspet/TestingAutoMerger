// angular
import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';

// app
import {IPosterWidget} from '../../common/poster/poster';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {UniTable, UniTableColumn, UniTableConfig} from 'unitable-ng2/main';
import {URLSearchParams} from '@angular/http';
import {ErrorService, JobService} from '../../../services/services';
import {Task, TaskStatus, TaskType} from '../../../unientities';
import {TaskService} from '../../../services/services';
import {TaskDetails} from '../details/taskDetails';

@Component({
    selector: 'task-list',
    templateUrl: './taskList.html',
})
export class TaskList implements OnInit {
    @ViewChild(UniTable)
    private table: UniTable;

    private tasksTableConfig: UniTableConfig;

    private tasks: any[];
    private selectedTask: any = new Task();

    private filterCompleted: boolean = false;

    constructor(
        private tabService: TabService,
        private taskService: TaskService,
        private errorService: ErrorService
    ) {
    }

    public ngOnInit() {
        this.tabService.addTab({
            name: 'Oppgaver',
            url: '/tasks',
            moduleID: UniModules.Tasks,
            active: true
        });

        //this.initTableConfig();
        this.initTaskList();

    }

/*    private initTableConfig() {
        this.tasksTableConfig = new UniTableConfig(false, true, 15)
            .setSearchable(true)
            .setColumns([new UniTableColumn('Title')]);
    }*/

    private initTaskList(filter: string = '') {
        this.taskService.GetAll(filter).subscribe(
            tasks => {
                this.tasks = tasks;

/// dummy data TODO remove
this.testData();       

            },
            err => this.errorService.handle(err)
        )
    }

    private onRowSelected(task: any) {
        this.selectedTask = task;
    }

    private onStatusFilterChange() {
        this.filterCompleted = !this.filterCompleted;

        if (this.filterCompleted) {
            alert('check');
            this.initTaskList('');
        } else {
            alert('uncheck');
            this.initTaskList('');
        }
    }

    // @TODO: remove this method if you can gather real data from server (questions? -> Attila) 
    private testData() {
        this.tasks = [{
            ID: 1,
            Title: 'Task  1 pending',
            StatusCode: TaskStatus.Pending,
            Type: TaskType.Task,
            UserID: 4
        },
        {
            ID: 2,
            Title: 'Task  2 active',
            StatusCode: TaskStatus.Active,
            Type: TaskType.Task,
            UserID: 1
        },
        {
            ID: 3,
            Title: 'Task  3 completed',
            StatusCode: TaskStatus.Complete,
            Type: TaskType.Task,
            UserID: 4
        }];
    }
}