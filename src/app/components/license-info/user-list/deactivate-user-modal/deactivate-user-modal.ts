import { Component, EventEmitter, OnInit } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal/interfaces';
import { ErrorService, ElsaContractService } from '@app/services/services';
import {ElsaUserLicense} from '@app/models';

@Component({
    selector: 'uni-deactivate-user-modal',
    templateUrl: './deactivate-user-modal.html',
})
export class DeactivateUserModal implements IUniModal, OnInit {
    options: IModalOptions = {};
    onClose: EventEmitter<boolean> = new EventEmitter();
    user: ElsaUserLicense;
    contractID: number;
    busy: boolean;
    validatorInput: number;
    validatorNumber: number;

    constructor(
        private errorService: ErrorService,
        private elsaContractService: ElsaContractService,
    ) { }

    ngOnInit() {
        this.contractID = this.options.data.contractID || 0;
        this.user = this.options.data.userLicense || {};
        this.validatorNumber = Math.floor(1000 + Math.random() * 8999);
    }

    deactivateUser() {
        this.busy = true;
        this.elsaContractService.deactivateUserLicenseOnContract(this.contractID, this.user.UserIdentity).subscribe(
            () => {
                this.busy = false;
                this.onClose.emit(true);
            },
            err => {
                this.busy = false;
                this.onClose.emit(false);
                this.errorService.handle(err);
            }
        );
    }
}
