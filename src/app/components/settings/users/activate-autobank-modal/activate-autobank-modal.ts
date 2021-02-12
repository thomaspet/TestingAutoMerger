import {Component, EventEmitter} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {UserService, ErrorService, BankService} from '@app/services/services';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {User} from '@uni-entities';
import {UniHttp} from '@uni-framework/core/http/http';
import { BankAgreementServiceProvider } from '@app/models/autobank-models';

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
    serviceProvider: BankAgreementServiceProvider;

    constructor(
        private errorService: ErrorService,
        private userService: UserService,
        private bankService: BankService,
        private toastService: ToastService,
        private http: UniHttp
    ) {}

    ngOnInit() {
        this.user = this.options.data.user || {};
        this.serviceProvider = this.options.data.serviceProvider || 1;

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

        if (this.serviceProvider !== BankAgreementServiceProvider.ZdataV3) {
            this.validatePassword(data);
        }

        if (!this.isValidPhoneNumber(data.Phone)) {
            this.errorMessages.push('Telefon må være et gyldig norsk telefonnummer');
        }

        if (!this.errorMessages.length) {
            this.activateBankUser(data);
        }
    }

    private validatePassword(data) {
        if (!data.Password || data.Password.length < 10 || data.ConfirmPassword !== data.Password) {
            this.errorMessages.push('Passord og bekreft passord må være like og minst 10 tegn');
        }

        if (!/[a-z]/.test(data.Password)) {
            this.errorMessages.push('Passord må inneholde minst en liten bokstav [a-z]');
            return;
        }

        if (!/[A-Z]/.test(data.Password)) {
            this.errorMessages.push('Passord må inneholde minst en stor bokstav [A-Z]');
            return;
        }

        if (!/[\d]/.test(data.Password)) {
            this.errorMessages.push('Passord må inneholde minst ett tall [0-9]');
            return;
        }
        if (!/[\@\#\$\%\^\&\*\-_\\+\=\[\]\{\}\:\,\.\?\!\`\(\)\;]/.test(data.Password)) {
            this.errorMessages.push('Passord må inneholde minst ett tegn: ! @ # $ % ^ & * _ - = + . : ? , ( ) [ ] { }');
            return;
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

        if (this.serviceProvider === BankAgreementServiceProvider.ZdataV3) {
            // ZDataV3 doesn't require an autobank password
            this.makeAutobankUser(autobankData);
        } else {
            this.bankService.validateAutobankPassword(autobankData.AdminPassword).subscribe(isCorrectPassword => {
                if (isCorrectPassword) {
                    this.makeAutobankUser(autobankData);
                } else {
                    this.busy = false;
                    this.hasSentWrongPassword = true;
                    this.errorMessages.push('Noe gikk galt. Sjekk at ditt autobank passord er korrekt.');
                }
            }, err => this.errorService.handle(err));
        }
    }

    private makeAutobankUser(autobankData) {
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
