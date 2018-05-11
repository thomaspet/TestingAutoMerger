import {Component, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {AuthService} from '../../../../authService';

@Component({
    selector: 'navbar-create-new',
    template: `
        <i *ngIf="links?.length"
            class="material-icons"
            role="button"
            [matMenuTriggerFor]="menu">
            add_circle
        </i>

        <mat-menu #menu="matMenu" yPosition="below" [overlapTrigger]="false">
            <ng-template matMenuContent>
                <section class="navbar-link-dropdown">
                    <strong>Opprett ny</strong>
                    <ul>
                        <li *ngFor="let link of links">
                            <a [routerLink]="link.url">
                                {{link.name}}
                            </a>
                        </li>
                    </ul>
                </section>
            </ng-template>
        </mat-menu>
    `
})

export class NavbarCreateNew {
    public links: any[] = [];

    constructor(
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private router: Router
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
            { name: 'Timeføring', url: '/timetracking/timeentry' },
            { name: 'Leverandør', url: '/accounting/suppliers/0' },
            { name: 'Fakturamottak', url: '/accounting/bills/0' },
        ];
    }
}
