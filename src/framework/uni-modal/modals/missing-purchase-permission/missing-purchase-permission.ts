import { Component, EventEmitter } from '@angular/core';
import { forkJoin } from 'rxjs';

import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { UserRoleService, UserService } from '@app/services/services';
import { User } from '@uni-entities';

@Component({
    selector: 'missing-purchase-permission-modal',
    templateUrl: './missing-purchase-permission.html',
    styleUrls: ['./missing-purchase-permission.sass']
})
export class MissingPurchasePermissionModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean;
    administrators: User[];

    constructor(
        private userRoleService: UserRoleService,
        private userService: UserService,
    ) {
        this.busy = true;

        forkJoin(
            this.userService.GetAll(),
            this.userRoleService.GetAll()
        ).subscribe(
            res => {
                const [users, userRoles] = res;
                this.administrators = users.filter(user => {
                    return userRoles.some(role => {
                        return role.UserID === user.ID
                            && role.SharedRoleName === 'Administrator';
                    });
                });
            },
            err => this.administrators = [],
            () => this.busy = false
        );
    }
}
