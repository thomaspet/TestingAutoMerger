import {Component, EventEmitter} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UserService, ErrorService} from '@app/services/services';
import {User} from '@app/unientities';
import {forkJoin} from 'rxjs';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'user-settings-modal',
    templateUrl: './user-settings-modal.html',
    styleUrls: ['./user-settings-modal.sass']
})
export class UserSettingsModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean;
    user: User;
    userDetailsForm: FormGroup;
    autobankPasswordForm: FormGroup;
    epostButtonClicked: boolean;

    constructor(
        private errorService: ErrorService,
        private userService: UserService,
        private toast: ToastService
    ) {}

    public ngOnInit() {
        this.user = this.options.data || {};
        this.epostButtonClicked = false;

        this.userDetailsForm = new FormGroup({
            DisplayName: new FormControl(this.user.DisplayName),
            PhoneNumber: new FormControl(this.user.PhoneNumber),
            Email: new FormControl(this.user.Email)
        });
    }

    save() {
        const saveRequests = [];

        if (this.userDetailsForm.dirty) {
            const model = this.userDetailsForm.value;

            this.user.DisplayName = model.DisplayName;
            this.user.PhoneNumber = model.PhoneNumber;
            this.user.Email = model.Email;

            saveRequests.push(this.userService.Put(this.user.ID, this.user));
        }

        this.busy = true;
        if (saveRequests.length) {
            forkJoin(saveRequests).subscribe(
                () => this.onClose.emit(true),
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        } else {
            this.onClose.emit(false);
        }
    }

    resetAutobankPassword() {
        this.userService.changeAutobankPassword().subscribe(
            () => this.toast.addToast('E-post er sendt', ToastType.good, ToastTime.short),
            err => this.errorService.handle(err)
        );
    }
}
