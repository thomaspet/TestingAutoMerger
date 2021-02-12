import {Component, EventEmitter} from '@angular/core';
import {forkJoin} from 'rxjs';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ElsaUserLicense, ElsaCustomer} from '@app/models';
import {ElsaCustomersService, ElsaContractService, ErrorService} from '@app/services/services';

@Component({
    selector: 'add-admin-modal',
    templateUrl: './add-admin-modal.html',
    styleUrls: ['./add-admin-modal.sass']
})
export class AddAdminModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean;
    customer: ElsaCustomer;
    users: ElsaUserLicense[];
    filteredUsers: ElsaUserLicense[];
    filterValue: string;
    header: string;

    constructor(
        private errorService: ErrorService,
        private elsaCustomerService: ElsaCustomersService,
        private elsaContractService: ElsaContractService
    ) {}

    public ngOnInit() {
        const data = this.options.data || {};
        this.customer = data.customer;
        this.header = this.options.header;
        this.busy = true;

        this.elsaContractService.getUserLicenses(data.contractID).subscribe(
            users => {
                users = (users || []).filter(u => {
                    return u.Email && !this.customer.Managers?.some(m => {
                        return m.User && m.User.Email === u.Email;
                    }) && !this.customer.CustomerRoamingUsers?.some(ru => {
                        return ru && ru.Email === u.Email;
                    });
                });

                this.users = users.sort((user1, user2) => {
                    const row1Value = user1.UserName || user1.Email;
                    const row2Value = user2.UserName || user2.Email;

                    if (row1Value) {
                        return row1Value.localeCompare(row2Value);
                    } else {
                        return 1;
                    }
                });

                this.filteredUsers = this.users;
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    filterUsers() {
        this.filteredUsers = this.users.filter(user => {
            const filter = (this.filterValue || '').toLowerCase();
            return (user.UserName || '').includes(filter)
                || (user.Email || '').includes(filter);
        });
    }

    save() {
        const selectedUsers = this.users.filter(u => u['_selected']);
        const requests = selectedUsers.map(user => {
            if (this.options.data.addAdmin) {
                return this.elsaCustomerService.addAdmin(this.customer.ID, user.Email);
            }
            return this.elsaCustomerService.addRoamingUser(this.customer.ID, user.Email);
        });

        if (requests.length) {
            this.busy = true;
            forkJoin(requests).subscribe(
                () => this.onClose.emit(true),
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        } else {
            this.onClose.emit(false);
        }
    }
}
