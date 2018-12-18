import {Component, EventEmitter} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UserService, ErrorService} from '@app/services/services';
import {User} from '@app/unientities';
import {forkJoin} from 'rxjs';

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

    constructor(
        private errorService: ErrorService,
        private userService: UserService
    ) {}

    public ngOnInit() {
        this.user = this.options.data || {};

        this.userDetailsForm = new FormGroup({
            DisplayName: new FormControl(this.user.DisplayName),
            PhoneNumber: new FormControl(this.user.PhoneNumber),
            Email: new FormControl(this.user.Email)
        });

        this.autobankPasswordForm = new FormGroup({
            currentPassword: new FormControl(''),
            newPassword: new FormControl(''),
            confirmNewPassword: new FormControl('')
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

        if (this.autobankPasswordForm.dirty) {
            const model = this.autobankPasswordForm.value;
            const passwordsMatch = model.newPassword === model.confirmNewPassword;

            // TODO: should probably have validation here (length etc)
            if (passwordsMatch) {
                saveRequests.push(this.userService.changeAutobankPassword({
                    Password: model.currentPassword,
                    NewPassword: model.newPassword
                }));
            }
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
}
