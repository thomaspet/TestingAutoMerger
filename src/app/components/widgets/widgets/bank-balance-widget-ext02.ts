import {Component, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import {AuthService} from '@app/authService';
import {BrunoOnboardingService} from '@app/services/services';
import {BankIntegrationAgreement} from '@uni-entities';
import {IUniWidget} from '../uniWidget';

@Component({
    selector: 'bank-balance-widget-ext02',
    template: `
        <section class="widget-wrapper">
            <section class="header">
                <span> {{ widget.description }}</span>
            </section>

            <section *ngIf="missingData" class="no-content" style="flex-direction: column; text-align: center; padding: 2rem;">
                <img [src]="icon" class="material-icons" style="margin-bottom: 1rem; font-size: 3rem; width: 8rem;">
                <span [innerHtml]="msg" style="font-size: 14px"></span>
                <span style="font-size: 14px"><a (click)="startOnboarding()" [innerHtml]="actionLink"></a> <span [innerHtml]="actionMsg"></span></span>
            </section>

            <bank-balance-chart *ngIf="showChart"></bank-balance-chart>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankBalanceWidgetExt02 implements AfterViewInit {
    widget: IUniWidget;

    missingData: boolean;
    agreement: BankIntegrationAgreement;
    msg: string = '';
    actionLink: string;
    actionMsg: string;
    icon: string = '';

    iconWarning: string = 'themes/ext02/ext02BankBalanceWidget-Warning.svg';
    iconPending: string = 'themes/ext02/ext02BankBalanceWidget-Pending.svg';
    iconConfig: string = 'themes/ext02/ext02BankBalanceWidget-Config.svg';

    showChart: boolean;

    constructor(
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private brunoOnboardingService: BrunoOnboardingService,
    ) {}

    startOnboarding() {
        this.brunoOnboardingService.startOnboarding()
            .subscribe(() => {
                this.brunoOnboardingService.onAgreementStatusChanged.subscribe(() => {
                    this.ngAfterViewInit();
                });
            });
    }

    public ngAfterViewInit() {
        if (this.authService.activeCompany.IsTest) {
            this.showChart = true;
            this.cdr.markForCheck();
            return;
        }

        this.msg = '';
        this.actionLink = '';
        this.actionMsg = '';
        this.icon = '';

        if (this.widget) {
            this.brunoOnboardingService.getAgreement().subscribe(
                agreement => {
                    this.agreement = agreement;
                    if (this.brunoOnboardingService.isActiveAgreement(this.agreement) &&
                        !this.brunoOnboardingService.hasNewAccountInfo(agreement)) {
                        this.showChart = true;
                        this.cdr.markForCheck();
                    }

                    if (!this.agreement) {
                        this.msg = 'For å se saldo på bankkonto, trenger du en autobankavtale med banken. <br/>';
                        this.actionLink = 'Klikk her';
                        this.actionMsg = ' for å koble sammen bank og regnskap.';
                        this.icon = this.iconConfig;
                        this.missingData = true;
                        this.cdr.markForCheck();
                    } else if (this.brunoOnboardingService.isPendingAgreement(this.agreement)) {
                        this.msg = 'Du har bestilt integrasjon med nettbanken din og vi jobber <br/> med å sette den opp. ' +
                            'Dette kan ta inntil 3 arbeidsdager.';
                        this.actionLink = 'Ble du avbrutt? Start på nytt';
                        this.actionMsg = '';
                        this.icon = this.iconPending;
                        this.missingData = true;
                        this.cdr.markForCheck();
                    } else if (this.brunoOnboardingService.hasNewAccountInfo(this.agreement)) {
                        this.brunoOnboardingService.isFirstOnboarding(this.agreement).subscribe((isFirstOnboarding) => {
                            this.msg = isFirstOnboarding ?
                                'Integrasjon er klar fra banken. <br/> Hjelp oss å knytte riktige kontoer til DNB Regnskap. <br/>' :
                                'Vi har mottatt nye kontoer fra banken. <br/> Hjelp oss å knytte riktige kontoer til DNB Regnskap. <br/>';
                            this.actionLink = ' Sett opp kontoen(e) her';
                            this.actionMsg = '';
                            this.icon = this.iconWarning;
                            this.missingData = true;
                            this.cdr.markForCheck();
                        });
                    }
                },
                err => {
                    this.msg = 'Kunne ikke hente data';
                    this.actionLink = '';
                    this.actionMsg = '';
                    this.icon = this.iconWarning;
                    this.missingData = true;
                    this.cdr.markForCheck();
                }
            );
        }
    }
}
