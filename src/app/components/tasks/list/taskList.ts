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
import {Task, TaskStatus, TaskType, ApprovalStatus} from '../../../unientities';
import {TaskService, ApprovalService, UserService} from '../../../services/services';
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
        private approvalService: ApprovalService,
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

                this.markMyTasks();
                this.filterIrrelevantTasks();
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

    private initTaskList(filter: string = 'filter=StatusCode ne 50030') {
        this.taskService.invalidateCache();
        filter += '&orderby=ID desc';
        this.taskService.GetAll(filter, ['approvals']).subscribe(
            tasks => {
                this.tasks = tasks;
                this.initNewTask();
            },
            err => this.errorService.handle(err)
        )
    }

    private markMyTasks() {
        if (this.tasks !== undefined) {
            for (var i = 0; i < this.tasks.length; ++i) {
                this.tasks[i].myTask = 
                        (
                                (this.tasks[i].Type === TaskType.Task) 
                            && 
                                (this.tasks[i].UserID === this.newTask.UserID)
                        ) 
                    || 
                        (
                            (this.tasks[i].Type === TaskType.Approval) 
                                && 
                            (this.isCurrentUserAnApprover(this.tasks[i]))
                        );
            }
        }
    }

    private isCurrentUserAnApprover(task: any): boolean {
        var approver = false;

        var i = 0;
             
        while (i < task.Approvals.length && !approver) {
            if (task.Approvals[i].UserID === this.newTask.UserID) {
                task.approvalId = task.Approvals[i].ID;
                task.approvalIndex = i;
                approver = true;
            } else {
                ++i;
            }
        }
        return approver;
    }

    // to be called after 'markMyTasks' !!
    private filterIrrelevantTasks() {
        if (this.tasks !== undefined) {
            for (var i = 0; i < this.tasks.length; ++i) {
                if ((this.tasks[i].Type === TaskType.Approval) && !this.isActionRequiredByMe(this.tasks[i])) {
                    this.tasks.splice(i, 1);
                    --i;
                }
            }
        }
    }

    private isActionRequiredByMe(task: any): boolean {

        var actionRequired = task.myTask 
                && task.Approvals[task.approvalIndex].StatusCode === ApprovalStatus.Active;
        if (task.myTask) {
        console.log(task.ID + ' req: ' + actionRequired +  ' my: ' + task.myTask + ' index: ' + task.approvalIndex + ' statusCode: ' + task.Approvals[task.approvalIndex].StatusCode);
        }
        return actionRequired;
    }

    private onRowSelected(task: any) {
        this.selectedTask = task;
    }

    private onStatusFilterChange() {
        this.filterCompleted = !this.filterCompleted;

        // @TODO filters
        if (this.filterCompleted) {
            this.initTaskList('');
        } else {
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
        this.newTask.CreatedAt = new Date;
        this.newTask.StatusCode = TaskStatus.Pending;

        this.taskService.Post(this.newTask).subscribe(
            res2 => this.initTaskList(),
            err => this.errorService.handle(err));
    }

    private getButtonText(task: Task): string {
        let text = '';

        if (task.Type === TaskType.Task) {
            text = 'Fullfør';
        } else if (task.Type === TaskType.Approval) {
            text = 'Avvis';
        }
        return text;
    }

    private onComplete(task: Task) {
        this.taskService.PostAction(task.ID, 'complete').subscribe(
            res => this.initTaskList(),
            err => this.errorService.handle(err)
        );
    }

    private onApprove(task: any) {
        this.approvalService.PostAction(task.approvalId, 'approve').subscribe(
            res => this.updateTaskAfterApproval(task),
            err => this.errorService.handle(err)
        );
    }

    private onReject(task: any) {
        this.approvalService.PostAction(task.approvalId, 'reject').subscribe(
            res => this.initTaskList(),
            err => this.errorService.handle(err)
        );
    }

    private updateTaskAfterApproval(task: Task) {
        var approvedByAll = true;
        var i = 0;

        while (i < task.Approvals.length && approvedByAll) {
            if (task.Approvals[i].UserID !== this.newTask.UserID) {
                approvedByAll = task.Approvals[i].StatusCode === ApprovalStatus.Approved; 
            }
            ++i;
        }

        if (approvedByAll) {
            task.UserID = this.newTask.UserID;

            this.taskService.Put(task.ID, task).subscribe(
                res => this.onComplete(task),
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
}