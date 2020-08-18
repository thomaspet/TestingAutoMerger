import {Component, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {TaskModal} from '../../common/modals/task-modal/task-modal';
import {UniModalService} from '@uni-framework/uni-modal';
import {Task, TaskType, TaskStatus, User} from '../../../unientities';
import {TaskService, UserService, ErrorService} from '../../../services/services';
import {CommentService} from '../../../../framework/comments/commentService';
import * as moment from 'moment';

@Component({
    selector: 'uni-tasks',
    templateUrl: './tasks.html'
})
export class UniTasks {
    @ViewChild('taskList', { static: true })
    private taskList: ElementRef;

    private routeParam: number;

    public tasks: any[];
    public selectedTask: any = new Task();

    public currentUser: User;
    public users: User[];

    public showCompleted: boolean;
    public showOnlyMine: boolean = true;

    private comments: any[];

    constructor(
        private tabService: TabService,
        private taskService: TaskService,
        private userService: UserService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private commentService: CommentService,
        private modalService: UniModalService
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
            },
            err => this.errorService.handle(err)
        );
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

        if (task.StatusCode === 50030) {
            task['_completed'] = true;
        }

        return task;
    }

    public loadTasks() {
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

    public setShowOnlyMine(onlyMine: boolean) {
        this.showOnlyMine = onlyMine;
        this.loadTasks();
    }

    public completeTask(task: Task) {
        this.taskService.PostAction(task.ID, 'complete').subscribe(
            res => this.loadTasks(),
            err => this.errorService.handle(err)
        );
    }

    public addTask() {
        this.modalService.open(TaskModal).onClose.subscribe((taskAdded: boolean) => {
            if (taskAdded) {
                this.loadTasks();
            }
        });
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
}
