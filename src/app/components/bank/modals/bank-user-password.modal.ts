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
    selector: 'uni-bank-user-password-modal',
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
            <header>Admin passord</header>
            <article>
                <section [attr.aria-busy]="working">
                    <uni-form
                        [config]="{}"
                        [fields]="fields"
                        [model]="adminPassword">
                    </uni-form>

                    <footer>
                        <button (click)="accept()" class="good">Lagre og lukk</button>
                        <button (click)="close()" class="bad">Avbryt</button>
                    </footer>
                </section>
            </article>
        </section>
    `
})
export class UniBankUserPasswordModal implements IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose: EventEmitter<any> = new EventEmitter<any>(true);
    fields = fields;
    working = false;
    adminPassword = {
        Password: null
    };

    constructor(
        private userService: UserService,
        private http: UniHttp,
        private toast: ToastService,
        private errorService: ErrorService
    ) {}

    accept() {
        this.onClose.emit(this.adminPassword.Password);
    }

    close() {
        this.onClose.emit(false);
    }
}
