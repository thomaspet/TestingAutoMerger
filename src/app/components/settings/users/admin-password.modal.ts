import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {FieldType} from '@uni-framework/ui/uniform';
import {UserService} from '@app/services/common/userService';
import {UniHttp} from '@uni-framework/core/http/http';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {ErrorService} from '@app/services/common/errorService';

const fields = [{
    Property: 'Password',
    Label: 'Admin Passord',
    FieldType: FieldType.PASSWORD
}];


@Component({
    selector: 'uni-register-bank-user-modal',
    styles: [
        `
            article {
                padding: 1rem;
            }
            [aria-busy] {
                width: 100%;
            }
        `
    ],
    template: `
        <section role="dialog" class="uni-modal">
            <header><h1>Admin passord</h1></header>
            <article>
                <section [attr.aria-busy]="working">
                    <uni-form
                        [config]="{}"
                        [fields]="fields"
                        [model]="adminPassword">
                    </uni-form>

                    <footer>
                        <button *ngIf="!options?.data?.isResetPassword" (click)="accept()" class="good">Lagre og lukk</button>
                        <button *ngIf="options?.data?.isResetPassword"
                            (click)="resetAutobankPassword()" class="good">Tilbakestill passord</button>
                        <button (click)="close()" class="bad">Avbryt</button>
                    </footer>
                </section>
            </article>
        </section>
    `
})
export class UniAdminPasswordModal implements IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose: EventEmitter<any> = new EventEmitter<any>(true);
    fields = fields;
    working = false;
    adminPassword = {
        Password: ''
    };

    constructor(
        private userService: UserService,
        private http: UniHttp,
        private toast: ToastService,
        private errorService: ErrorService
    ) {}

    accept() {
        this.persistBankUser(this.options.data.user, this.options.data.bankData, this.adminPassword);
    }

    close() {
        this.onClose.emit(false);
    }

    private resetAutobankPassword() {
        this.onClose.emit(this.adminPassword.Password);
    }

    private persistBankUser(user, bankData, adminData) {
        this.working = true;
        this.userService.getCurrentUser()
            .subscribe(currentUser => this.http
                .asPUT()
                .withEndPoint(`users/${user.ID}?action=make-autobank-user`)
                .withBody({
                    AdminUserId: currentUser.ID,
                    AdminPassword: adminData.Password,
                    IsAdmin: bankData.IsAdmin,
                    Password: bankData.Password,
                    Phone: bankData.Phone
                })
                .send()
                .subscribe(
                    result => {
                        this.toast.addToast('Bruker lagt til som bankbruker', ToastType.good);
                        this.onClose.emit(true);
                        this.working = false;
                    },
                    err => {
                        this.errorService.handle(err);
                        this.working = false;
                    }
                )
            );
    }
}
