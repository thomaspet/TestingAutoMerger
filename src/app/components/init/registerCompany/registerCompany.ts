import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {AuthService} from '@app/authService';
import {CompanySettings, Contract} from '@uni-entities';
import {environment} from 'src/environments/environment';
import {InitService} from '@app/services/services';

export interface CompanyInfo {
    companySettings: CompanySettings;
    isTemplate: boolean;
    valid: boolean;
}

interface RegistrationOption {
    header: string;
    textSections: string[];
    buttonLabel: string;
    buttonClass?: string;
    action: () => void;
}

@Component({
    selector: 'uni-register-company',
    templateUrl: './registerCompany.html',
    styleUrls: ['./registerCompany.sass'],
})
export class RegisterCompany {
    appName = environment.isSrEnvironment ? 'SR-Bank Regnskap' : 'Uni Economy';

    selectedCompanyType: string;
    busy: boolean;
    missingContract = false;
    contractID: number;
    contracts: Contract[];

    registrationOptions: RegistrationOption[];

    constructor(
        private initService: InitService,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
    ) {
        this.route.queryParamMap.subscribe(params => {
            this.selectedCompanyType = params.get('type') || undefined;
        });

        this.authService.isAuthenticated().then(isAuthenticated => {
            if (isAuthenticated) {
                this.initService.getContracts().subscribe(contracts => {
                    if (contracts && contracts[0]) {
                        this.contractID = contracts[0].ID;
                        this.registrationOptions = environment.isSrEnvironment ? this.getSrOptions() : this.getUeOptions();
                    } else {
                        this.missingContract = true;
                    }
                });
            } else {
                this.router.navigateByUrl('/init/login');
            }
        });
    }

    onCompanyTypeSelected(type: string) {
        this.router.navigateByUrl('/init/register-company?type=' + type);
    }

    // tslint:disable
    getSrOptions() {
        return [
            {

                header: 'Prøv SR-Bank Regnskap',
                textSections: [
                    'For at du skal få best mulig inntrykk av systemet gir vi deg mulighet til å prøve en demo inntil 30 dager. Demobedriften er en fiktiv bedrift og inneholder ingen reelle data. Fakturaer vil ikke bli sendt noe sted, og du kan naturligvis ikke betale regninger eller lønn heller.',
                    'Når du er klar for å bestille Bank+Regnskap og ta i bruk SR-Bank Regnskap for fullt trykker du "Aktiver nå" øverst til høyre i skjermbildet.',
                ],
                buttonLabel: 'Start demoperiode',
                action: () => this.router.navigateByUrl('/init/register-company?type=demo')
            },
            // {
            //     header: 'Prøv med din egen bedrift',
            //     textSections: [
            //         'For å få et best mulig inntrykk av systemet kan du i demoperioden bruke din egen bedrift.',
            //         'Når du er klar for å ta i bruk systemet trykker du "Aktiver" øverst til høyre i skjermbildet. Ved aktivering vil data fra demoperioden følge med',
            //     ],
            //     buttonLabel: 'Start demoperiode',
            //     buttonClass: 'c2a',
            //     action: () => this.router.navigateByUrl('/init/register-company?type=company')
            // }
        ];
    }

    getUeOptions() {
        return [
            {
                header: 'Prøv et demoselskap',
                textSections: [
                    'Et demoselskap innneholder fiktive data og lar deg bli kjent med systemet før du registrerer din egen bedrift.',
                    'Fakturaer vil kun sendes til din epost adresse, og du kan naturligvis ikke betale regninger eller lønn.',
                    'Du kan når som helst i demoperioden velge å registrere din bedrift og begynne å jobbe med reelle data.'
                ],
                buttonLabel: 'Opprett demoselskap',
                action: () => this.router.navigateByUrl('/init/register-company?type=demo')
            },
            {
                header: 'Registrer din egen bedrift',
                textSections: [
                    'Registrer din egen bedrift her for å starte opp med Uni Economy i dag.',
                    'Prøveperioden vil fremdeles være gratis, men du kan begynne å jobbe med reelle data umiddelbart.',
                    'Ønsker du å prøve systemet med fiktive data før du bestemmer deg velger du demoselskap.'
                ],
                buttonLabel: 'Registrer din bedrift',
                buttonClass: 'c2a',
                action: () => this.router.navigateByUrl('/init/register-company?type=company')
            }
        ];
    }
}
