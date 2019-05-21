import {Component, Output, EventEmitter, Input} from '@angular/core';
import {GrantAccessData} from './grant-access-modal';
import {ElsaUserLicense} from '@app/models';
import {ErrorService} from '@app/services/common/errorService';
import {ElsaContractService} from '@app/services/services';

@Component({
    selector: 'select-users-for-bulk-access',
    templateUrl: './3.selectUsers.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class SelectUsersForBulkAccess {
    @Input() data: GrantAccessData;
    @Output() stepComplete: EventEmitter<boolean> = new EventEmitter();

    users: ElsaUserLicense[];

    constructor(
        private elsaContractService: ElsaContractService,
        private errorService: ErrorService,
    ) {}

    ngOnChanges() {
        if (this.data) {
            this.initData();
        }
    }

    private initData() {
        if (this.data.customer) {
            this.elsaContractService.getUserLicenses(
                this.data.contract.ID
            ).subscribe(
                users => {
                    if (this.data.users && this.data.users.length) {
                        users.forEach(user => {
                            if (this.data.users.some(u => u.UserIdentity === user.UserIdentity)) {
                                user['_selected'] = true;
                            }
                        });
                    }

                    this.users = users;
                },
                err => this.errorService.handle(err)
            );
        }
    }

    onSelectionChange() {
        this.data.users = this.users.filter(u => !!u['_selected']);
        this.stepComplete.emit(this.data.users.length > 0);
    }
}
