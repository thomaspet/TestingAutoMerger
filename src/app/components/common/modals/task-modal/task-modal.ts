import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {Task, User, TaskStatus} from '@uni-entities';
import {UserService, ErrorService, TaskService} from '@app/services/services';
import {FeaturePermissionService} from '@app/featurePermissionService';
import {AuthService} from '@app/authService';

@Component({
    selector: 'task-modal',
    templateUrl: './task-modal.html',
    styleUrls: ['./task-modal.sass']
})
export class TaskModal implements IUniModal {
    options: IModalOptions = {};
    onClose = new EventEmitter();

    busy: boolean;
    completeInProgress: boolean;
    dirty: boolean;
    task: Task;

    currentUser: User;
    users: User[] = [];

    userSelectConfig: any = {
        displayProperty: 'DisplayName',
        valueProperty: 'ID',
        searchable: true,
        hideDeleteButton: true
    };

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private taskService: TaskService,
        private errorService: ErrorService,
        private featurePermissionService: FeaturePermissionService
    ) { }

    ngOnInit() {
        this.currentUser = this.authService.currentUser;
        this.task = this.options?.data || <Task> {
            Title: '',
            Type: 0,
            StatusCode: TaskStatus.Pending,
            UserID: this.authService.currentUser.ID
        };

        if (this.featurePermissionService.canShowUiFeature('ui.task.assign-to-user')) {
            this.busy = true;
            this.userService.GetAll(null).subscribe(
                users => {
                    this.users = users;
                    this.busy = false;
                },
                err => {
                    console.error(err);
                    this.busy = false;
                }
            );
        }
    }

    save() {
        if (this.task.Title) {
            this.busy = true;

            const request = this.task.ID
                ? this.taskService.Put(this.task.ID, this.task)
                : this.taskService.Post(this.task);

            request.subscribe(
                () => this.onClose.emit(true),
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        }
    }

    completeTask() {
        if (!this.completeInProgress) {
            this.completeInProgress = true;
            this.taskService.PostAction(this.task.ID, 'complete').subscribe(
                () => this.onClose.emit(true),
                err => {
                    this.errorService.handle(err);
                    this.completeInProgress = false;
                }
            );
        }
    }

    onUserChange(user: User) {
        this.task.UserID = user.ID;
        this.dirty = true;
    }
}
