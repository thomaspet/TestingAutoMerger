import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import { Task, User, TaskStatus } from '@uni-entities';
import {UserService, ErrorService, TaskService} from '@app/services/services';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {Observable} from 'rxjs';

@Component({
    selector: 'new-task-modal',
    templateUrl: './new-task-list.html',
    styleUrls: ['./new-task-list.sass']
})

export class NewTaskModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    newTask: Task = new Task();
    currentUser: User;
    users: User[] = [];
    userSelectConfig: any = {
        displayProperty: 'DisplayName',
        searchable: true,
        hideDeleteButton: true
    };

    constructor(
        private userService: UserService,
        private taskService: TaskService,
        private errorService: ErrorService,
        private toast: ToastService
    ) { }

    public ngOnInit() {
        Observable.forkJoin(
            this.userService.getCurrentUser(),
            this.userService.GetAll(null)
        ).subscribe(
            res => {
                this.currentUser = res[0];
                this.users = res[1];

                this.initNewTask();
            },
            err => this.errorService.handle(err)
        );
    }

    initNewTask() {
        this.newTask = new Task();
        this.newTask.StatusCode = TaskStatus.Pending;
        this.newTask.Title = '';
        this.newTask.UserID = this.currentUser.ID;
        this.newTask.Type = 0;
    }

    save() {
        if (!this.newTask.Title) {
            this.toast.addToast('En oppgave må ha oppgavetekst', ToastType.warn, ToastTime.short);
            return;
        }
        this.newTask.CreatedAt = new Date;
        this.taskService.Post(this.newTask).subscribe(
            res => {
                this.toast.addToast('Ny oppgave lagt til', ToastType.good, ToastTime.short);
                this.close(true);
            },
            err => this.errorService.handle(err)
        );
    }

    close(emitValue?: boolean) {
        this.onClose.emit(emitValue);
    }

    onUserSelected(user: User) {
        this.newTask.UserID = user.ID;
    }
}
