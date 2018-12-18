import {Component, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {ErrorService} from '@app/services/services';
import {UniHttp} from '@uni-framework/core/http/http';

@Component({
    selector: 'invite-users-modal',
    templateUrl: './invite-users-modal.html',
    styleUrls: ['./invite-users-modal.sass'],
    host: {'class': 'uni-redesign'}
})
export class InviteUsersModal implements IUniModal {
    @ViewChild('emailInput') emailInput: ElementRef;

    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean;
    invalidInput: boolean;
    emailControl: FormControl = new FormControl('', Validators.email);

    constructor(
        private http: UniHttp,
        private errorService: ErrorService
    ) {}

    ngAfterViewInit() {
        if (this.emailInput && this.emailInput.nativeElement) {
            this.emailInput.nativeElement.focus();
        }
    }

    send() {
        this.invalidInput = false;
        if (this.isValidEmail()) {
            this.busy = true;

            this.http.asPOST()
                .usingBusinessDomain()
                .withEndPoint('user-verifications')
                .withBody({Email: this.emailControl.value})
                .send()
                .map(response => response.json())
                .subscribe(
                    () => this.onClose.emit(true),
                    err => {
                        this.errorService.handle(err);
                        this.busy = false;
                    }
                );
        } else {
            this.invalidInput = true;
        }
    }

    isValidEmail() {
        return this.emailControl.value && this.emailControl.valid;
    }
}
