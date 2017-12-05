import {Component, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {AuthService} from '../../../../authService';

@Component({
    selector: 'uni-shortcut',
    template: `
        <span class="shortcut_icon"
            *ngIf="availableComponents.length"
            [ngClass]="{'is-opened': open}"
            (clickOutside)="close()"
            (click)="toggle()">

            <ul class="shortcut_list" *ngIf="open">
                <li *ngFor="let component of availableComponents"
                    (click)="navigate(component.navigationUrl)">
                    {{ component.componentName }}
                </li>
            </ul>
        </span>
    `
})

export class UniShortcut {

    public availableComponents: Array<any> = [];
    public open: boolean = false;

    constructor(
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {
        this.authService.authentication$.subscribe(auth => {
            if (auth.user) {
                this.availableComponents = this.getAllowedRoutes(auth.user);
                this.cdr.markForCheck();
            }
        });
    }

    public toggle() {
        this.open = !this.open;
    }

    public close() {
        this.open = false;
    }

    public navigate(url: string) {
        this.open = false;
        this.router.navigateByUrl(url);
    }

    private getAllowedRoutes(user): any[] {
        let routeSections = this.getAvailableComponents();

        routeSections = routeSections.filter(item => {
            return this.authService.canActivateRoute(user, item.componentUrl);
        });

        return routeSections;
    }

    private getAvailableComponents() {
        return [
            {
                componentName: 'Ny faktura',
                componentUrl: '/sales/invoices',
                navigationUrl: '/sales/invoices/0',
                moduleID: UniModules.Invoices
            },
            {
                componentName: 'Ny ordre',
                componentUrl: '/sales/orders',
                navigationUrl: '/sales/orders/0',
                moduleID: UniModules.Orders
            },
            {
                componentName: 'Nytt tilbud',
                componentUrl: '/sales/quotes',
                navigationUrl: '/sales/quotes/0',
                moduleID: UniModules.Quotes
            },
            {
                componentName: 'Ny kunde',
                componentUrl: '/sales/customers',
                navigationUrl: '/sales/customer/0',
                moduleID: UniModules.Customers
            },
            {
                componentName: 'Nytt produkt',
                componentUrl: '/sales/products',
                navigationUrl: '/sales/products/0',
                moduleID: UniModules.Products
            },
            {
                componentName: 'Ny ansatt',
                componentUrl: '/salary/employees',
                navigationUrl: '/salary/employees/0/personal-details',
                moduleID: UniModules.Employees
            },
            {
                componentName: 'Ny timeføring',
                componentUrl: '/timetracking/timeentry',
                navigationUrl: '/timetracking/timeentry',
                moduleID: UniModules.Timesheets
            },
            {
                componentName: 'Ny leverandør',
                componentUrl: '/accounting/suppliers',
                navigationUrl: '/accounting/suppliers/0',
                moduleID: UniModules.Suppliers
            },
            {
                componentName: 'Nytt fakturamottak',
                componentUrl: '/accounting/bills',
                navigationUrl: '/accounting/bills/0',
                moduleID: UniModules.Bills
            },
        ];
    }
}
