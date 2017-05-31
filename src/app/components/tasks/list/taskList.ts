import {Component, ElementRef, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ISelectConfig} from 'uniform-ng2/main';
import {ErrorService} from '../../../services/services';
import {Task, TaskStatus, TaskType, ApprovalStatus, User} from '../../../unientities';
import {TaskService, ApprovalService, UserService} from '../../../services/services';
import * as moment from 'moment';

@Component({
    selector: 'uni-task-list',
    templateUrl: './taskList.html',
})
export class TaskList implements OnInit {
    @ViewChild('taskList')
    private taskList: ElementRef;

    @Output()
    private taskSelected: EventEmitter<Task> = new EventEmitter();

    // TODO: update unientities so we can actually use Task entitiy..
    private tasks: any[];
    private filteredTasks: any[];
    private selectedTask: any = new Task();

    private newTask: any = new Task();

    private currentUser: User;
    private users: User[];
    private userSelectConfig: ISelectConfig;

    private showCompleted: boolean;
    private typeFilter: TaskType;

    constructor(
        private tabService: TabService,
        private taskService: TaskService,
        private approvalService: ApprovalService,
        private userService: UserService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.tabService.addTab({
            name: 'Oppgaver',
            url: '/tasks',
            moduleID: UniModules.Tasks,
            active: true
        });

        Observable.forkJoin(
            this.userService.getCurrentUser(),
            this.userService.GetAll(null)
        ).subscribe(
            res => {
                this.currentUser = res[0];
                this.users = res[1];

                this.getTasks();
                this.initNewTask();
            },
            err => this.errorService.handle(err)
        );

        this.userSelectConfig = {
            displayProperty: 'DisplayName',
            searchable: true
        };
     }

    private addTaskMetadata(task: Task): Task {
        let assignedBy = this.users.find(u => u.GlobalIdentity === task.CreatedBy);
        if (assignedBy) {
            task['_assignedBy'] = assignedBy.DisplayName;
        }

        if (task.CreatedAt) {
            task['_createdDate'] = moment(task.CreatedAt).format('DD. MMM YYYY');
        }

        if (task.StatusCode === TaskStatus.Complete) {
            task['_completed'] = true;
        }

        if (task.Type === TaskType.Approval && task.StatusCode === TaskStatus.Active) {
            task['_activeApproval'] = true;
        }

        return task;
    }

    private getTasks() {
        this.taskService.invalidateCache();
        let odata = 'orderby=ID';
        if (!this.showCompleted) {
            odata += '&filter=StatusCode ne ' + TaskStatus.Complete;
        }

        this.taskService.GetAll(odata, ['approvals']).subscribe(
            tasks => {
                this.tasks = tasks.map(t => this.addTaskMetadata(t));
                this.filterTasks(this.typeFilter);
                this.selectTask(this.filteredTasks[this.filteredTasks.length - 1]);

                // Scroll to bottom of list
                setTimeout(() => {
                    const listElement = this.taskList && this.taskList.nativeElement;
                    if (listElement) {
                        listElement.scrollTop = listElement.scrollHeight;
                    }
                });

            },
            err => this.errorService.handle(err)
        );
    }

    private filterTasks(type?: TaskType) {
        this.typeFilter = type;

        // Filter out tasks that doesn't belong to us
        this.tasks = this.tasks.filter((task: Task) => {
            if (task.Type === TaskType.Approval) {
                let approvals = task.Approvals || [];
                let myApproval = approvals.find(a => a.UserID === this.currentUser.ID);

                return myApproval && myApproval.StatusCode === ApprovalStatus.Active;
            } else {
                return task.UserID === this.currentUser.ID;
            }
        });

        // Filter based on type
        if (type === undefined) {
            this.filteredTasks = [...this.tasks];
        } else {
            this.filteredTasks = this.tasks.filter((t: Task) => t.Type === type);
        }
    }

    private initNewTask() {
        this.newTask = new Task();
        this.newTask.StatusCode = TaskStatus.Pending;
        this.newTask.Title = '';
        this.newTask.UserID = this.currentUser.ID;
    }

    public toggleShowCompleted() {
        this.showCompleted = !this.showCompleted;
        this.getTasks();
    }

    public completeTask(task: Task) {
        this.taskService.PostAction(task.ID, 'complete').subscribe(
            res => this.getTasks(),
            err => this.errorService.handle(err)
        );
    }

    public approveTask(task: any) {
        this.approvalService.PostAction(task.approvalId, 'approve').subscribe(
            res => this.updateTaskAfterApproval(task),
            err => this.errorService.handle(err)
        );
    }

    public rejectTask(task: any) {
        this.approvalService.PostAction(task.approvalId, 'reject').subscribe(
            res => this.getTasks(),
            err => this.errorService.handle(err)
        );
    }

    public addTask() {
        this.newTask.CreatedAt = new Date;
        this.newTask.StatusCode = TaskStatus.Pending;
        this.taskService.Post(this.newTask).subscribe(
            res => {
                this.newTask.Title = '';
                this.getTasks();
            },
            err => this.errorService.handle(err)
        );
    }

    private selectTask(task: any) {
        this.selectedTask = task;
        this.taskSelected.next(task);
    }

    private onUserSelected(event) {
        this.newTask.UserID = event.ID;
    }

    private isValidInput() {
        return /\S/.test(this.newTask.Title);
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
                res => this.completeTask(task),
                err => this.errorService.handle(err)
            );

        }
    }
}
