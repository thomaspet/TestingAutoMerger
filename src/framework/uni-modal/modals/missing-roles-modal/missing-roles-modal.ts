import {Component, EventEmitter} from '@angular/core';
import {IUniModal} from '@uni-framework/uni-modal';
import {UserService} from '@app/services/services';
import {User} from '@uni-entities';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
    selector: 'missing-roles-modal',
    templateUrl: './missing-roles-modal.html',
    styleUrls: ['./missing-roles-modal.sass']
})
export class MissingRolesModal implements IUniModal {
    onClose = new EventEmitter();

    admins: User[];
    scrollbar: PerfectScrollbar;
    busy: boolean;

    constructor(private userService: UserService) {}

    ngOnInit() {
        this.busy = true;
        this.userService.getAdmins().subscribe(
            admins => {
                this.busy = false;
                this.admins = admins || [];
                setTimeout(() => {
                    this.scrollbar = new PerfectScrollbar('#missing-roles-dialog-body');
                });
            },
            err => {
                console.error(err);
                this.busy = false;
            }
        );
    }
}
