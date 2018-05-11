import {Component, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ISelectConfig} from '../../../../framework/ui/uniform/index';
import {Task, TaskType, TaskStatus, User} from '../../../unientities';
import {TaskService, UserService, ErrorService} from '../../../services/services';
import {CommentService} from '../../../../framework/comments/commentService';
import * as moment from 'moment';

@Component({
    selector: 'uni-tasks',
    templateUrl: './tasks.html'
})
export class UniTasks {
    @ViewChild('taskList')
    private taskList: ElementRef;

    private tasks: any[];
    private selectedTask: any = new Task();

    private newTask: any = new Task();

    private routeParam: number;
    private currentUser: User;
    private users: User[];
    private userSelectConfig: ISelectConfig;

    private showCompleted: boolean;
    private showOnlyMine: boolean = true;

    private comments: any[];

    constructor(
        private tabService: TabService,
        private taskService: TaskService,
        private userService: UserService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private commentService: CommentService
    ) {
        this.route.params.subscribe((params) => {
            this.routeParam = +params['id'];
            if (this.routeParam) {
                // show all in case tasks/<routeParam> is not ours
                this.showOnlyMine = false;
            }
        });
    }

    public ngOnInit() {
        this.tabService.addTab({
            name: 'Oppgaver',
            url: '/assignments/tasks',
            moduleID: UniModules.Assignments,
            active: true
        });

        Observable.forkJoin(
            this.userService.getCurrentUser(),
            this.userService.GetAll(null)
        ).subscribe(
            res => {
                this.currentUser = res[0];
                this.users = res[1];

                this.loadTasks();
                this.initNewTask();
            },
            err => this.errorService.handle(err)
        );

        this.userSelectConfig = {
            displayProperty: 'DisplayName',
            searchable: true,
            hideDeleteButton: true
        };
     }

     private addTaskMetadata(task: Task): Task {
        const assignedBy = this.users.find(u => u.GlobalIdentity === task.CreatedBy);
        if (assignedBy) {
            task['_assignedBy'] = assignedBy.DisplayName;
        }

        const assignedTo = this.users.find(u => u.ID === task.UserID);
        if (assignedTo) {
            task['_assignedTo'] = assignedTo.DisplayName;
        }

        if (task.CreatedAt) {
            task['_createdDate'] = moment(task.CreatedAt).format('DD. MMM YYYY');
        }

        return task;
    }

    private loadTasks() {
        this.taskService.invalidateCache();
        let filterString = 'filter=Type eq ' + TaskType.Task;

        if (!this.showCompleted) {
            filterString += ' and StatusCode ne ' + TaskStatus.Complete;
        }

        if (this.showOnlyMine && this.currentUser) {
            filterString += ' and UserID eq ' + this.currentUser.ID;
        }

        this.taskService.GetAll(filterString).subscribe(
            tasks => {
                this.tasks = tasks.map(t => this.addTaskMetadata(t));

                let selectedIndex = this.tasks.findIndex(t => t.ID === this.routeParam);
                if (selectedIndex < 0) {
                    selectedIndex = this.tasks.length - 1;
                }

                this.selectedTask = this.tasks[selectedIndex];
                this.scrollToListItem(selectedIndex);
            },
            err => this.errorService.handle(err)
        );
    }

    private scrollToListItem(index: number) {
        setTimeout(() => {
            const list = this.taskList.nativeElement || {children: []};
            const listItem = list.children[index];
            if (!listItem) {
                return;
            }

            const bottom = list.scrollTop + list.offsetHeight - listItem.offsetHeight;

            if (listItem.offsetTop <= list.scrollTop) {
                list.scrollTop = listItem.offsetTop;
            } else if (listItem.offsetTop >= bottom) {
                list.scrollTop = listItem.offsetTop - (list.offsetHeight - listItem.offsetHeight);
            }
        });
    }

    private initNewTask() {
        this.newTask = new Task();
        this.newTask.StatusCode = TaskStatus.Pending;
        this.newTask.Title = '';
        this.newTask.UserID = this.currentUser.ID;
    }

    public setShowOnlyMine(onlyMine: boolean) {
        this.showOnlyMine = onlyMine;
        this.loadTasks();
    }

    public toggleShowCompleted() {
        this.showCompleted = !this.showCompleted;
        this.loadTasks();
    }

    public completeTask(task: Task) {
        this.taskService.PostAction(task.ID, 'complete').subscribe(
            res => this.loadTasks(),
            err => this.errorService.handle(err)
        );
    }

    public addTask() {
        this.newTask.CreatedAt = new Date;
        this.newTask.StatusCode = TaskStatus.Pending;
        this.taskService.Post(this.newTask).subscribe(
            res => {
                this.newTask.Title = '';
                this.loadTasks();
            },
            err => this.errorService.handle(err)
        );
    }

    private getComments() {
        this.commentService.getAll('Task', this.selectedTask.ID)
            .subscribe(
                res => this.comments = res,
                err => this.errorService.handle(err)
            );
    }

    public submitComment(text: string) {
        this.commentService.post('Task', this.selectedTask.ID, text)
            .subscribe(
                res => this.getComments(),
                err => this.errorService.handle(err)
            );
    }

    public onUserSelected(event) {
        this.newTask.UserID = event.ID;
    }

    public isValidInput() {
        return /\S/.test(this.newTask.Title);
    }


}
