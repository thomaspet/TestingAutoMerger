import {Component, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {UniHttp} from '@uni-framework/core/http/http';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'reset-autobank-password-modal',
    templateUrl: './reset-autobank-password-modal.html',
    styleUrls: ['./reset-autobank-password-modal.sass'],
    host: {'class': 'uni-redesign'}
})
export class ResetAutobankPasswordModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean;

    constructor(
        private toast: ToastService,
        private http: UniHttp
    ) {}

    resetPassword() {
        const user = this.options.data;
        if (user) {
            this.busy = true;

            this.http
                .asPOST()
                .usingBusinessDomain()
                .withEndPoint('users/' + user.ID + '?action=reset-autobank-password')
                .send()
                .map(res => res.body)
                .subscribe(
                    () => {
                        this.toast.addToast(
                            'Tilbakestilling vellykket',
                            ToastType.good, 10,
                            `${user.DisplayName} vil snart få en epost der de kan lage nytt passord`
                        );

                        this.onClose.emit();
                    },
                    () => {
                        this.busy = false;
                        this.toast.addToast(
                            'Kunne ikke tilbakestille passord',
                            ToastType.bad, 10,
                            'Noe gikk galt ved tilbakestilling. Prøv å last inn bilde på nytt og prøv igjen'
                        );
                    },
                );
        }
    }
}
