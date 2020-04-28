import {Component, EventEmitter} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {UserService, ErrorService, BankService} from '@app/services/services';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
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
    hasSentWrongPassword = false;

    constructor(
        private errorService: ErrorService,
        private userService: UserService,
        private bankService: BankService,
        private toastService: ToastService,
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

        if (!data.Password || data.Password.length < 10 || data.ConfirmPassword !== data.Password) {
            this.errorMessages.push('Passord og bekreft passord må være like og minst 10 tegn');
        }

        if (!this.isValidPhoneNumber(data.Phone)) {
            this.errorMessages.push('Telefon må være et gyldig norsk telefonnummer');
        }

        if (!/[a-zæøå]/.test(data.Password)) {
            this.errorMessages.push('Passord må inneholde minst en liten bokstav');
            return;
        }

        if (!/[A-ZÆØÅ]/.test(data.Password)) {
            this.errorMessages.push('Passord må inneholde minst en stor bokstav');
            return;
        }

        if (!/[\d]/.test(data.Password)) {
            this.errorMessages.push('Passord må inneholde minst ett tall');
            return;
        }
        if (!/[\@\#\$\%\^\&\*\-_\\+\=\[\]\{\}\:\,\.\?\!\`\(\)\;]/.test(data.Password)) {
            this.errorMessages.push('Passord må inneholde minst ett tegn: ! @ # $ % ^ & * _ - = + . : ? , ( ) [ ] { }');
            return;
        }

        if (!this.errorMessages.length) {
            this.activateBankUser(data);
        }
    }

    close() {
        this.onClose.emit();
    }

    resetPassword() {
        this.busy = true;
        this.userService.changeAutobankPassword().subscribe(
            () => {
                this.toastService.addToast('E-post er sendt', ToastType.good, ToastTime.short);
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    private activateBankUser(autobankData) {
        this.busy = true;

        this.bankService.validateAutobankPassword(autobankData.AdminPassword).subscribe(isCorrectPassword => {
            if (isCorrectPassword) {

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
                        .map(res => res.body);
                }).subscribe(
                    () => this.onClose.emit(true),
                    err => {
                        this.busy = false;
                        this.errorMessages.push('Noe gikk galt. Se melding i varsel');
                        this.errorService.handle(err);
                    }
                );

            } else {
                this.busy = false;
                this.hasSentWrongPassword = true;
                this.errorMessages.push('Noe gikk galt. Sjekk at ditt autobank passord er korrekt.');
            }
        }, err => this.errorService.handle(err));
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
