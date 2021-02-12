import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef} from '@angular/core';
import {UserService} from '@app/services/common/userService';
import {IUniModal, IModalOptions, ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {AuthService} from '@app/authService';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'confirm-twofactor-modal',
    templateUrl: './confirm-twofactor-modal.html',
    styleUrls: ['./confirm-twofactor-modal.sass'],
})

export class ConfirmTwoFactorModal implements OnInit, IUniModal {
    @ViewChild('codeElement', { static: true }) codeElement: ElementRef;

    @Input() options: IModalOptions;
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    busy = true;
    msg: string = '';
    reference: string = '';

    model: any = {
        Code: ''
    }

    constructor (
        private userService: UserService,
        private authService: AuthService,
        private toastService: ToastService,
    ) {}

    ngOnInit() {
        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Godkjenn',
                cancel: 'Avbryt'
            };
        }
        if (!this.options.header) {
            this.options.header = 'To-faktor godkjenning';
        }
        this.reference = this.options.data?.reference;

        this.busy = true;
        this.userService.sendUserCodeChallenge(this.reference).subscribe(() => {
            this.busy = false;
            setTimeout(() => this.focus());
        }, err => {
            this.msg = this.translateError(err, true);
            this.busy = false;
        });
    }

    private translateError(err, challenge) {
        let msg = '';
        if (err.status == 403)
        {
            msg = 'Din bruker må være satt opp som bankbruker samt ha to-faktor påskrudd.';
        }
        else if (err.status == 400 && err.error.Message.indexOf('2FA is not enabled') > 0) {
            msg = challenge
                ? 'To-faktor må være påskrudd for din bruker. Gå til brukerinnstillinger for din bruker og skru dette på.'
                : 'Ugyldig kode';
        }
        else {
            msg = 'En feil oppstod, prøv igjen senere.';
        }

        return msg;
    }

    verify() {
        this.userService.verifyUserCodeChallenge(this.model.Code, this.reference).subscribe((verification) => {
            // Reload to get updated 2FA auth time
            this.authService.refreshToken().then(() => {
                this.accept();
            });
        }, (err) => {
            this.reject(this.translateError(err, false));
        });
    }

    focus() {
        if (this.codeElement && this.codeElement.nativeElement) {
            this.codeElement.nativeElement.focus();
        }
    }

    public accept() {
        this.onClose.emit(ConfirmActions.ACCEPT);
    }

    public reject(msg) {
        this.toastService.addToast('Godkjenning avvist', ToastType.bad, 15, msg);
        this.onClose.emit(ConfirmActions.REJECT);
    }

    public cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }
}