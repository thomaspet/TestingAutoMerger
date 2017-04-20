// angular
import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';

// app
import {IPosterWidget} from '../../common/poster/poster';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {UniSelect, ISelectConfig} from 'uniform-ng2/main';
import {ErrorService, JobService} from '../../../services/services';
import {Task, TaskStatus, TaskType} from '../../../unientities';
import {TaskService, UserService} from '../../../services/services';
import {TaskDetails} from '../details/taskDetails';

@Component({
    selector: 'task-list',
    templateUrl: './taskList.html',
})
export class TaskList implements OnInit {
    @ViewChild(UniSelect)
    private userSelectDropdown: UniSelect;

    private tasks: any[];
    private selectedTask: Task = new Task();

    private newTask: Task = new Task();
    
    private users: any[];
    private userSelectConfig: ISelectConfig;

    private filterCompleted: boolean = false;

    constructor(
        private tabService: TabService,
        private taskService: TaskService,
        private userService: UserService,
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

        this.initUserList();
        this.initTaskList();

    }

    private initNewTask() {
        this.newTask = new Task();
        this.newTask.StatusCode = TaskStatus.Pending;
        this.newTask.Title = '';
        this.newTask.EntityType = 'FC59C9C3-0DEA-42CE-91D0-148DF3211EA5';

        this.userService.getCurrentUser().subscribe(
            user => {
                this.newTask.UserID = user.ID;
                this.newTask.EntityID = user.ID;
            },
            err => this.errorService.handle(err)
        );
    }

    private initUserList() {
        this.userSelectConfig = {
            displayProperty: 'DisplayName',
            placeholder: 'Meg',
            searchable: true
        };

        this.userService.GetAll(null).subscribe(
            users => this.users = users,
            err => this.errorService.handle(err)
        );
    }

    private initTaskList(filter: string = '') {
        this.taskService.GetAll(filter).subscribe(
            tasks => {
                this.tasks = tasks;
                this.initNewTask();
/// dummy data TODO remove
//this.testData();       

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

    private onUserSelect(event) {
        this.newTask.UserID = event.ID;
    }

    private isValidInput() {
        return /\S/.test(this.newTask.Title);
    }

    private addTask() {
        this.userService.getCurrentUser().subscribe(
            user => {
                this.newTask.CreatedAt = new Date;
                this.newTask.UserID = user.ID;
                this.newTask.StatusCode = TaskStatus.Pending;
                this.newTask.User = user;

                this.taskService.Post(this.newTask).subscribe(
                    res2 => this.initTaskList(),
                    err => this.errorService.handle(err));
            },
            err => this.errorService.handle(err)
        );
    }

    private getButtonText(task: Task): string {
        let text = 'Start';

        if (task.StatusCode === TaskStatus.Active) {
            text = 'Fullfør';
        } else if (task.StatusCode === TaskStatus.Complete) {
            text = 'Avvis';
        }
        return text;
    }

    private onStatusChange(task: Task) {
        let action: string;

        switch (task.StatusCode) {
            case TaskStatus.Pending:
                action = 'activate';
                break;
            case TaskStatus.Active:
                action = 'complete';
                break;
            case TaskStatus.Complete:
                action = 'activate';
                break;
            default:
                break;
        }

        if (action !== undefined) {
            this.taskService.PostAction(task.ID, action).subscribe(
                res => this.initTaskList(),
                err => this.errorService.handle(err)
            );
        }
    }

    private isCompleted(task: Task) {
        return task.StatusCode === TaskStatus.Complete;
    }

    private isApproval(task: Task) {
        return task.Type === TaskType.Approval && task.StatusCode === TaskStatus.Active;
    }

    private onApprove(task: Task) {

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