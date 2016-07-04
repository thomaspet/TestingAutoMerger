﻿import {Component, Host, ElementRef, Pipe} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, AsyncRoute} from '@angular/router-deprecated';
import {NgFor, NgClass} from '@angular/common';
import {ROUTES} from '../../../../route.config';
declare var jQuery;

@Pipe({name: 'removehidden'})
export class RemoveHidden {
  constructor(){}

  transform(componentList) {
    return componentList.filter((x) => !(x.hidden || false));
  }
}

@Component({
    selector: 'uni-hamburger-menu',
    template: `
        <nav class="navbar_hamburger" [ngClass]="{'is-active': open}">
            <ul class="navbar_menu">
                <li *ngFor="let componentList of availableComponents; let i = index" class="listElement" [ngClass]="{true:'is-active', false:''}[i==0]">
                    {{componentList.componentListName}}
                    <ul>
                        <h3>{{componentList.componentListHeader}}</h3>
                        <li *ngFor="let component of componentList.componentList | removehidden" (click)="navigate(component.componentUrl)">
                            {{component.componentName}}
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>
    `,
    directives: [ROUTER_DIRECTIVES, NgFor, NgClass],
    host: {
        '(click)': 'onClick($event)',
        '(document:click)': 'offClick()'
    },
    pipes: [RemoveHidden]
})
export class HamburgerMenu {
    private open: boolean = false;

    public routes: AsyncRoute[] = ROUTES;
    public availableComponents: Array<any>;

    public static getAvailableComponents(): Array<any> {


        return [
            {
                componentListName: 'Nøkkeltall',
                componentListHeader: 'Alt om deres økonomi',
                componentList: [
                    {componentName: 'Nøkkeltall', componentUrl: '/'},
                    {componentName: 'Brukerinnstillinger', componentUrl: '/settings/user', hidden: true},
                    {componentName: 'Firmainnstillinger', componentUrl: '/settings/company', hidden: true},
                    {componentName: 'AGA innstillinger', componentUrl: '/settings/agaandsubentities', hidden: true},
                    {componentName: 'Legg til bruker', componentUrl: '/settings/users', hidden: true},
                    {componentName: 'Brukere og roller', componentUrl: '/settings/users', hidden: true},
                    {componentName: 'Altinn', componentUrl: '/settings/altinn', hidden: true}
                ]
            },
            {
                componentListName: 'Salg',
                componentListHeader: 'Utgående salg',
                componentList: [
                    {componentName: 'Kunder', componentUrl: '/sales'},
                    {componentName: 'Tilbud', componentUrl: '/sales/quote'},
                    {componentName: 'Ordre', componentUrl: '/sales/order'},
                    {componentName: 'Faktura', componentUrl: '/sales/invoice'},
                    {componentName: 'Produkter', componentUrl: '/products'}
                ]
            },
            {
                componentListName: 'Regnskap',
                componentListHeader: 'Orden i bøkene',
                componentList: [
                    {componentName: 'Bilagsføring', componentUrl: '/accounting'},  
                    {componentName: 'Leverandørfaktura', componentUrl: '/accounting/journalentry/supplierinvoices/list', hidden: true},
                    {componentName: 'Betaling', componentUrl: '/accounting/journalentry/payments', hidden: true}, 
                    {componentName: 'Forespørsel på konto', componentUrl: '/accounting/transquery'},
                    {componentName: 'Forespørsel på bilag', componentUrl: '/accounting/transquery/details'},
                    {componentName: 'Kontoinnstillinger', componentUrl: '/accounting/accountsettings'},
                    {componentName: 'MVA innstillinger', componentUrl: '/accounting/vatsettings'},                    
                    {componentName: 'Leverandører', componentUrl: '/sales/supplier'}
                ]
            },
            {
                componentListName: 'Lønn',
                componentListHeader: 'Lønn og ansatte',
                componentList: [
                    {componentName: 'Ansatte', componentUrl: '/salary/employees'},
                    {componentName: 'Lønnsarter', componentUrl: '/salary/wagetypes'},
                    {componentName: 'Lønnsavregninger', componentUrl: '/salary/payrollrun'}
                ]
            },
            {
                componentListName: 'Timer',
                componentListHeader: 'Timer',
                componentList: [
                    {componentName: 'Stillingsmaler', componentUrl: '/timetracking/workprofile'},                    
                    {componentName: 'Personer', componentUrl: '/timetracking/worker'},
                    {componentName: 'Timearter', componentUrl: '/timetracking/worktypes'},                    
                    {componentName: 'Registrere timer', componentUrl: '/timetracking'}
                ]
            },            
            {
                componentListName: 'Rapporter',
                componentListHeader: 'Oversikt på papir',
                componentList: [
                    {componentName: 'Rapportoversikt', componentUrl: '/reports'}
                ]
            }
        ];
    }

    constructor(public router: Router, private elementRef: ElementRef) {
        this.availableComponents = HamburgerMenu.getAvailableComponents();
    }

    public ngAfterViewInit() {
        jQuery('.listElement').mouseover(function() {
            jQuery(this).addClass('is-active');
            jQuery(this).siblings().removeClass('is-active');
        });
    }

    private onClick(event) {
        event.stopPropagation();
        if (event.target.tagName === 'NAV') {
            this.open = !this.open;
        }
    }

    private offClick() {
        this.open = false;
    }

    private navigate(url: string): void {
        this.open = false;
        this.router.navigateByUrl(url);
    }
}
