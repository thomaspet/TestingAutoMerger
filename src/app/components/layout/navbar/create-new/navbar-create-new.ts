import {Component, ChangeDetectorRef} from '@angular/core';
import {AuthService} from '@app/authService';

@Component({
    selector: 'navbar-create-new',
    template: `
        <ng-container *ngIf="links">
            <uni-icon #toggle [icon]="'add'"></uni-icon>

            <dropdown-menu [trigger]="toggle" minWidth="12rem">
                <ng-template>
                    <span class="dropdown-menu-header">Opprett ny</span>
                    <a class="dropdown-menu-item" *ngFor="let link of links" [routerLink]="link.url">
                        {{link.name | translate}}
                    </a>
                </ng-template>
            </dropdown-menu>
        </ng-container>
    `
})

export class NavbarCreateNew {
    links: any[] = [];

    constructor(
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
    ) {
        this.authService.authentication$.subscribe(auth => {
            if (auth.user) {
                this.links = this.filterLinksByPermissions(auth.user);
                this.cdr.markForCheck();
            }
        });
    }

    private filterLinksByPermissions(user): any[] {
        const links = this.getLinks();

        return links.filter(link => {
            return this.authService.canActivateRoute(user, link.url);
        });
    }

    private getLinks() {
        return [
            { name: 'Faktura', url: '/sales/invoices/0' },
            { name: 'Ordre', url: '/sales/orders/0' },
            { name: 'Tilbud', url: '/sales/quotes/0' },
            { name: 'Bilag', url: '/accounting/journalentry/manual' },
            { name: 'Kunde', url: '/sales/customer/0' },
            { name: 'Produkt', url: '/sales/products/0' },
            { name: 'Ansatt', url: '/salary/employees/0/personal-details' },
            { name: 'Timeføring', url: '/timetracking/timeentry?mode=Registrering' },
            { name: 'Leverandør', url: '/accounting/suppliers/0' },
            { name: 'ACCOUNTING.SUPPLIER_INVOICE.SINGLE', url: '/accounting/bills/0' },
        ];
    }
}
