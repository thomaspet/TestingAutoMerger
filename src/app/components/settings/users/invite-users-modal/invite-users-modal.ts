import {Component, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {forkJoin, Observable} from 'rxjs';
import {switchMap, finalize} from 'rxjs/operators';

import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {ElsaProduct} from '@app/models';
import {Role} from '@uni-entities';
import {
    ErrorService,
    RoleService,
    ElsaProductService,
    ElsaPurchaseService,
    UserService,
    UserRoleService
} from '@app/services/services';


interface RoleGroup {
    label: string;
    roles: Role[];
    product?: ElsaProduct;
    productPurchased?: boolean;
}

@Component({
    selector: 'invite-users-modal',
    templateUrl: './invite-users-modal.html',
    styleUrls: ['./invite-users-modal.sass'],
    host: {'class': 'uni-redesign'}
})
export class InviteUsersModal implements IUniModal {
    @ViewChild('emailInput') emailInput: ElementRef;

    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean;
    invalidInput: boolean;
    missingRoles: boolean;

    emailControl: FormControl = new FormControl('', Validators.email);
    roleGroups: RoleGroup[];

    constructor(
        private errorService: ErrorService,
        private userService: UserService,
        private roleService: RoleService,
        private userRoleService: UserRoleService,
        private productService: ElsaProductService,
        private elsaPurchaseService: ElsaPurchaseService
    ) {
        this.busy = true;

        forkJoin(
            this.roleService.GetAll(),
            this.productService.GetAll()
        ).pipe(
            finalize(() => this.busy = false)
        ).subscribe(
            res => this.roleGroups = this.groupRolesByProduct(res[0], res[1]),
            err => this.errorService.handle(err),
        );
    }

    ngAfterViewInit() {
        if (this.emailInput && this.emailInput.nativeElement) {
            this.emailInput.nativeElement.focus();
        }
    }

    onProductPurchaseChange(group) {
        if (group.productPurchased) {
            group.roles[0]['_checked'] = true;
        } else {
            group.roles.forEach(role => role['_checked'] = false);
        }

        this.setActiveRoleCount(group);
    }

    onRoleClick(group, role) {
        if (group.productPurchased) {
            role['_checked'] = !role['_checked'];
            this.setActiveRoleCount(group);
        }
    }

    private setActiveRoleCount(group: RoleGroup) {
        group['_activeRoleCount'] = group.roles.reduce((count, role) => {
            return role['_checked'] ? count + 1 : count;
        }, 0);
    }

    groupRolesByProduct(roles: Role[], products: ElsaProduct[]): RoleGroup[] {
        roles = roles || [];
        products = products || [];

        const filteredProducts = products.filter(product => {
            return product.productTypeName === 'Module' && product.name !== 'Complete';
        });

        const groups: RoleGroup[] = filteredProducts.map(product => {
            return {
                label: product.label,
                roles: [],
                selectedRoles: [],
                product: product
            };
        });

        // Fill the groups with roles
        roles.forEach(role => {
            const roleNameLowerCase = (role.Name || '').toLowerCase();

            const groupsThatShouldHaveRole = groups.filter(group => {
                const listOfRoles = group.product && group.product.listOfRoles || '';
                return listOfRoles.trim().split(',').some(roleName => {
                    return roleName.toLowerCase() === roleNameLowerCase;
                });
            });

            if (groupsThatShouldHaveRole.length) {
                groupsThatShouldHaveRole.forEach(group => {
                    group.roles.push(role);
                });
            }
        });

        return groups.filter(group => group.roles && group.roles.length);
    }

    send() {
        const products = [];
        const roles = [];

        this.roleGroups.forEach(group => {
            if (!group.product || group.productPurchased) {
                const checkedRoles = group.roles.filter(role => role['_checked']);
                if (checkedRoles.length) {
                    roles.push(...checkedRoles);
                    if (group.product) {
                        products.push(group.product);
                    }
                }
            }
        });

        this.missingRoles = !roles.length;
        this.invalidInput = !this.emailControl.value || !this.emailControl.valid;

        if (!this.missingRoles && !this.invalidInput) {
            this.busy = true;

            this.userService.inviteUser(this.emailControl.value).pipe(
                switchMap(user => this.addUserRoles(user, roles))
            ).subscribe(
                () => {
                    // Invalidate purchase cache since backend will
                    // add purchases on the user when activating
                    this.elsaPurchaseService.invalidateCache();
                    this.onClose.emit(true);
                },
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        }
    }

    private addUserRoles(user, roles: Role[]) {
        if (user && roles && roles.length) {
            const userRoles = roles.map(role => {
                return {
                    UserID: user.ID,
                    SharedRoleId: role.ID,
                    SharedRoleName: role.Name
                };
            });

            return this.userRoleService.bulkUpdate(userRoles);
        }

        return Observable.throw('Brukeren er invitert, men setting av roller feilet');
    }
}
