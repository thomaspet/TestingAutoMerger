import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UserService} from '@app/services/services';
import {User} from '@uni-entities';

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

    constructor(private userService: UserService) {
        this.busy = true;

        this.userService.getAdmins().subscribe(
            admins => {
                this.administrators = admins;
                this.busy = false;
            },
            err => {
                console.error(err);
                this.busy = false;
            }
        );
    }
}
