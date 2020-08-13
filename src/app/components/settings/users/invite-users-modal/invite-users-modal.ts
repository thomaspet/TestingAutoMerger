import {Component, EventEmitter} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {ErrorService, ElsaPurchaseService, UserService} from '@app/services/services';

@Component({
    selector: 'invite-users-modal',
    templateUrl: './invite-users-modal.html',
    styleUrls: ['./invite-users-modal.sass'],
    host: {'class': 'uni-redesign'}
})
export class InviteUsersModal implements IUniModal {

    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean;
    invalidInput: boolean;

    emailControl: FormControl = new FormControl('', Validators.email);

    constructor(
        private errorService: ErrorService,
        private userService: UserService,
        private elsaPurchaseService: ElsaPurchaseService
    ) { }

    send() {
        this.invalidInput = !this.emailControl.value || !this.emailControl.valid;

        if (!this.invalidInput) {
            this.busy = true;

            this.userService.inviteUser(this.emailControl.value).subscribe(
                user => {
                    // Invalidate purchase cache since backend will
                    // add purchases on the user when activating
                    this.elsaPurchaseService.invalidateCache();
                    this.onClose.emit(user);
                },
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        }
    }
}
