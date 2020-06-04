import {Component, HostBinding} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {AuthService} from '@app/authService';
import {CompanySettings, Contract} from '@uni-entities';
import {InitService, ElsaContractService, ErrorService} from '@app/services/services';
import {Subscription, forkJoin} from 'rxjs';
import {theme, THEMES} from 'src/themes/theme';
import {ElsaContractType, ElsaContract} from '@app/models';

export interface CompanyInfo {
    companySettings: CompanySettings;
    isTemplate: boolean;
    valid: boolean;
}

interface RegistrationOption {
    header: string;
    priceTag?: string;
    textSections: string[];
    footerText?: string;
    buttons: {
        label: string;
        class?: string;
        action: () => void;
    }[];
}

@Component({
    selector: 'uni-register-company',
    templateUrl: './registerCompany.html',
    styleUrls: ['./registerCompany.sass'],
})
export class RegisterCompany {
    hasInitialized: boolean;

    appName = theme.appName;
    tokenSubscription: Subscription;

    selectedCompanyType: string;
    isTest: boolean;
    busy: boolean;
    missingContract = false;
    contractID: number;
    contracts: Contract[];

    registrationOptions: RegistrationOption[];
    illustration = theme.init.illustration;

    hasActiveContract: boolean;

    @HostBinding('style.background') background = theme.init.background || '#fff';
    @HostBinding('class.ext02') usingExt02Theme = theme.theme === THEMES.EXT02;

    constructor(
        private initService: InitService,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
        private errorService: ErrorService,
        private elsaContractService: ElsaContractService
    ) {
        this.route.queryParamMap.subscribe(params => {
            this.isTest = params.get('isTest') === 'true' || false;
            this.selectedCompanyType = params.get('type') || undefined;
        });

        this.tokenSubscription = this.authService.token$.subscribe(token => {
            if (token) {
                if (!this.hasInitialized) {
                    this.init();
                }
            } else {
                this.router.navigateByUrl('/init/login');
            }
        });
    }

    ngOnDestroy() {
        if (this.tokenSubscription) {
            this.tokenSubscription.unsubscribe();
        }
    }

    init() {
        forkJoin(
            // this.initService.getContracts(),
            this.elsaContractService.getAll(),
            this.elsaContractService.getContractTypes(),
        ).subscribe(([contracts, contractTypes]: [ElsaContract[], ElsaContractType[]]) => {
            const contract = contracts && contracts[0];
            if (contracts) {
                this.contractID = contract.ID;
                this.registrationOptions = theme.theme === THEMES.SR
                    ? this.getSrOptions()
                    : this.getUeOptions();

                const demoContractType = (contractTypes || []).find(type => type.Name === 'Demo');
                console.log(contract);

                const isDemo = contract.ContractType === demoContractType.ContractType;
                this.hasActiveContract = !isDemo && contract.AgreementAcceptances?.length > 0;

            } else {
                this.missingContract = true;
            }

        }, err => this.errorService.handle(err));
    }

    navigate(url: string) {
        this.router.navigateByUrl(url);
    }

    // tslint:disable
    getSrOptions() {
        return [
            {
                header: 'Bestill Bank + Regnskap',
                priceTag: '199,- per måned',
                textSections: [
                    '0,- i etablering',
                    '1 måneds oppsigelsestid',
                ],
                footerText: 'Registrer deg i dag og få første måned gratis',
                buttons: [{
                    label: 'Bestill Bank + Regnskap',
                    class: 'good',
                    action: () => this.router.navigateByUrl('/init/register-company?type=company')
                }]
            },

            {
                header: 'Prøv gratis demo i 30 dager',
                textSections: [
                    'Med demo har du mulighet til å bli kjent med systemet før du bestemmer deg. Her kan du teste funksjoner uten at fakturaer faktisk blir sendt og lønn blir utbetalt.',
                    'Du kan prøve demo med fiktive data, eller demo hvor du bruker data fra din egen bedrift'
                ],
                buttons: [
                    {
                        label: 'Start demo med fiktiv bedrift',
                        class: 'secondary',
                        action: () => this.router.navigateByUrl('/init/register-company?type=demo')
                    },
                    {
                        label: 'Start demo med din bedrift',
                        class: 'c2a',
                        action: () => this.router.navigateByUrl('/init/register-company?type=company&isTest=true')
                    }
                ]
            },

        ];
    }

    getUeOptions() {
        return [
            {
                header: 'Prøv et demoselskap',
                textSections: [
                    'Et demoselskap innneholder fiktive data og lar deg bli kjent med systemet før du registrerer din egen bedrift.',
                    'Fakturaer vil kun sendes til din epost adresse, og du kan naturligvis ikke betale regninger eller lønn.',
                    'Du kan når som helst i demoperioden velge å registrere din bedrift og begynne å jobbe med reelle data.',
                ],
                buttons: [{
                    label: 'Opprett demoselskap',
                    action: () => this.router.navigateByUrl('/init/register-company?type=demo')
                }]
            },
            {
                header: 'Registrer din egen bedrift',
                textSections: [
                    'Registrer din egen bedrift her for å starte opp med Uni Economy i dag.',
                    'Prøveperioden vil fremdeles være gratis, men du kan begynne å jobbe med reelle data umiddelbart.',
                    'Ønsker du å prøve systemet med fiktive data før du bestemmer deg velger du demoselskap.',
                ],
                buttons: [{
                    label: 'Registrer din bedrift',
                    class: 'c2a',
                    action: () => this.router.navigateByUrl('/init/register-company?type=company')
                }]
            }
        ];
    }
}
