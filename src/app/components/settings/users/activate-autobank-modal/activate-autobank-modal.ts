import {Component, EventEmitter} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {UserService, ErrorService} from '@app/services/services';
import {User} from '@uni-entities';
import {UniHttp} from '@uni-framework/core/http/http';

@Component({
    selector: 'activate-autobank-modal',
    templateUrl: './activate-autobank-modal.html',
    styleUrls: ['./activate-autobank-modal.sass']
})
export class ActivateAutobankModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    user: User;
    autobankData: FormGroup;
    errorMessages: string[];
    busy: boolean;

    constructor(
        private errorService: ErrorService,
        private userService: UserService,
        private http: UniHttp
    ) {}

    ngOnInit() {
        this.user = this.options.data || {};

        this.autobankData = new FormGroup({
            AdminPassword: new FormControl(''),
            Password: new FormControl(''),
            ConfirmPassword: new FormControl(''),
            Phone: new FormControl(this.user.PhoneNumber || ''),
            IsAdmin: new FormControl(false),
        });
    }

    submit() {
        const data = this.autobankData.value;
        this.errorMessages = [];

        if (!data.Password || data.ConfirmPassword !== data.Password) {
            this.errorMessages.push('Passord og bekreft passord må være like');
        }

        if (!this.isValidPhoneNumber(data.Phone)) {
            this.errorMessages.push('Telefon må være et gyldig norsk telefonnummer');
        }

        if (!this.errorMessages.length) {
            this.activateBankUser(data);
        }
    }

    close() {
        this.onClose.emit();
    }

    private activateBankUser(autobankData) {
        this.busy = true;

        this.userService.getCurrentUser().switchMap(authenticatedUser => {
            return this.http.usingBusinessDomain()
                .asPUT()
                .withEndPoint(`users/${this.user.ID}?action=make-autobank-user`)
                .withBody({
                    AdminUserId: authenticatedUser.ID,
                    AdminPassword: autobankData.AdminPassword,
                    IsAdmin: autobankData.IsAdmin,
                    Password: autobankData.Password,
                    Phone: autobankData.Phone
                })
                .send()
                .map(res => res.json());
        }).subscribe(
            () => this.onClose.emit(true),
            err => {
                this.busy = false;
                this.errorMessages.push('Noe gikk galt. Sjekk at ditt autobank passord er korrekt.');
            }
        );
    }

    private isValidPhoneNumber(phone) {
        const test1 = /^\d{8}$/.test(phone);
        const test2 = /^0047\d{8}$/.test(phone);
        const test3 = /^\+47\d{8}$/.test(phone);

        if (test1 || test2 || test3) {
            return true;
        } else {
            return false;
        }
    }
}
