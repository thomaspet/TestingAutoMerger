import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef} from '@angular/core';
import {UserService} from '@app/services/services';
import {IUniModal, IModalOptions, ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {AuthService} from '@app/authService';

@Component({
    selector: 'confirm-twofactor-modal',
    templateUrl: './confirm-twofactor-modal.html'
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
            if (err.status == 403)
            {
                this.msg = 'Din bruker må være satt opp som bankbruker samt ha to-faktor påskrudd.';
            }
            else if (err.status == 400 && err.error.Message.indexOf('2FA is not enabled') > 0) {
                this.msg = 'To-faktor må være påskrudd for din bruker. Gå til brukerinnstillinger for din bruker og skru dette på.';
            }
            else {
                this.msg = 'En feil oppstod, prøv igjen senere.';
            }
            this.busy = false;
        });
    }

    verify() {
        this.userService.verifyUserCodeChallenge(this.model.Code, this.reference).subscribe((verification) => {
            // Reload to get updated 2FA auth time
            this.authService.refreshToken().then(() => {
                this.accept();
            });
        }, () => {
            this.reject();
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

    public reject() {
        this.onClose.emit(ConfirmActions.REJECT);
    }

    public cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }
}