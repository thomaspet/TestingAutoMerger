import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {BehaviorSubject} from 'rxjs';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {
    UserService,
    ErrorService,
    CompanySettingsService,
    BankService,
    ElsaAgreementService
} from '@app/services/services';
import {Observable} from 'rxjs';
import {AutoBankAgreementDetails, BankAgreementServiceProvider} from '@app/models/autobank-models';
import {StatusCodeBankIntegrationAgreement} from '@uni-entities';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
    selector: 'uni-autobank-agreement-modal',
    styles: [`
        .step2 {
            width: 90vw !important;
        }
        object {
            width: 100% !important;
            min-height: 35vw;
        }
        #step2 {
            text-align: center;
        }`
    ],
    template: `
        <section role="dialog" class="uni-modal uni-autobank-agreement-modal uni-redesign" [class.step2]="steps === 2">
            <i class="material-icons close-bankagreement-button" (click)="close(false)"> close </i>
            <div style="width: 20vw; flex: 1" class="progressbar_container">
                <p> Veiviser for ny autobank avtale </p>
                <ul class="autobank_progressbar">
                    <li>
                        <span [class.is-active-step]="steps === 0">  </span>
                        <div [class.is-active-step]="steps === 0"> Intro </div>
                    </li>
                    <li>
                        <span [class.is-active-step]="steps === 1">  </span>
                        <div [class.is-active-step]="steps === 1"> Firmavalg </div>
                    </li>
                    <li>
                        <span [class.is-active-step]="steps === 2">  </span>
                        <div [class.is-active-step]="steps === 2"> Avtalevilkår </div>
                    </li>
                    <li *ngIf="serviceProvider !== 1">
                        <span [class.is-active-step]="steps === 3">  </span>
                        <div [class.is-active-step]="steps === 3"> Godkjenne betalinger </div>
                    <li>
                        <span [class.is-active-step]="steps === 4">  </span>
                        <div [class.is-active-step]="steps === 4"> Bankoppsett </div>
                    </li>
                    <li *ngIf="serviceProvider !== 4">
                        <span [class.is-active-step]="steps === 5">  </span>
                        <div [class.is-active-step]="steps === 5"> Sikkerhet </div>
                    </li>
                    <li>
                        <span [class.is-active-step]="steps === 6">  </span>
                        <div [class.is-active-step]="steps === 6"> Ferdigstilling </div>
                    </li>
                </ul>
            </div>
            <div style="width: 40vw; flex: 2; display: flex; flex-direction: column; justify-content: center;">
                <article class="uni-autobank-agreement-modal-body" *ngIf="steps === 0" id="step0"
                    style="width: 65%; display: flex; justify-content: center; flex-direction: column; margin: 0 auto;">
                    <h3>Oppsett for ny autobankavtale</h3>
                    <p>
                        For å komme i gang med autobank trenger vi informasjon fra dere for å koble opp mot deres bank.
                        Du trenger bare en avtale per bank, selv om du har flere bankkontoer.
                        Banker som kan velges mellom hentes fra bankkontoer satt opp i firmainnstillinger.
                    </p>
                    <p>
                        Oppsettet mot de ulike bankene varierer, og for å sikre best mulig automasjon kan vi kunne trenge ekstra
                        informasjon. I slike tilfeller vil dere bli kontaktet av <strong>Uni Micro AS</strong> eller <strong>Zdata</strong>.
                    </p>
                    <span *ngIf="agreements.length">
                        Du har allerede aktive avtaler med følgende bank{{ usedBanks.length > 1 ? 'er' : '' }}: <br/>
                        <strong *ngFor="let bank of usedBanks; let i = index;">
                            {{ bank }}{{ i < usedBanks.length - 1 ? ', ' : '' }}
                        </strong>
                    </span>
                </article>
                <article class="uni-autobank-agreement-modal-body" *ngIf="steps === 1" id="step1"
                    style="width: 65%; display: flex; justify-content: center; flex-direction: column; margin: 0 auto;">
                    <!-- ADD COMPANY SELECTION HERE WHEN THAT IS AVAILABLE! -->
                    <h3>Firma</h3>
                    <p> Ny autobankavtale for klienten du står på: <br/><strong>{{ companySettings?.CompanyName }}</strong> </p>
                </article>
                <article *ngIf="steps === 2" class="uni-autobank-agreement-modal-body" id="step2">
                    <ng-container *ngIf="bankAgreementUrl">
                        <object [data]="bankAgreementUrl" type="application/pdf">
                            <a [href]="bankAgreementUrl">Avtalevilkår</a>
                        </object>
                        <br>
                        <mat-checkbox [(ngModel)]="hasReadAgreement">
                            Godta vilkår og avtaler
                        </mat-checkbox>
                    </ng-container>
                    <p *ngIf="!bankAgreementUrl">
                        Fant ingen avtalevilkår. Kontakt systemansvarlig.
                    </p>
                </article>
                <article class="uni-autobank-agreement-modal-body" *ngIf="steps === 3" id="step3"
                    style="width: 75%; display: flex; justify-content: center; flex-direction: column; margin: 0 auto;">
                    <h3>Godkjenning av betalinger</h3>
                    <p>
                        Her velger du metoden for å godkjenne betalinger: velger du regnskapsgodkjente betalinger kan du forhåndsgodkjenne betalingene,
                        ellers må du ettergodkjenne betalingene i nettbanken.
                    </p>
                    <mat-radio-group [(ngModel)]="agreementDetails.BankApproval">
                        <mat-radio-button [value]="false">Regnskapsgodkjente betalinger</mat-radio-button>
                        <mat-radio-button [value]="true">Ettergodkjente betalinger i nettbanken</mat-radio-button>
                    </mat-radio-group>
                </article>
                <article class="uni-autobank-agreement-modal-body" *ngIf="steps === 4" id="step4"
                    style="width: 75%; display: flex; justify-content: center; flex-direction: column; margin: 0 auto;">
                    <uni-form
                        style="font-size: .9rem; width: 80%"
                        [config]="{showLabelAbove: true, autoFocus: true}"
                        [fields]="formFields$"
                        [model]="formModel$"
                        (changeEvent)="onFormChange($event)">
                    </uni-form>
                    <label class="uni-label agreement-checkboxes">
                        <span>Marker for å ta med i avtale</span>
                        <mat-checkbox [(ngModel)]="agreementDetails.IsInbound">
                            Innbetalinger
                        </mat-checkbox>
                        <mat-checkbox [(ngModel)]="agreementDetails.IsOutgoing">
                            Utbetalinger
                        </mat-checkbox>
                        <mat-checkbox [(ngModel)]="agreementDetails.IsBankBalance">
                            Banksaldo + avstemming
                            <i class="material-icons" [matTooltip]="infoTextForBalance">info</i>
                        </mat-checkbox>
                    </label>
                </article>
                <article class="uni-autobank-agreement-modal-body" *ngIf="steps === 5 && !hasAgreements" id="step5"
                    style="width: 75%; display: flex; justify-content: center; flex-direction: column; margin: 0 auto;">
                    <h3>Sikkerhetsinnstillinger</h3>
                    <p>
                        Velg et passord for autobank. Dette passordet brukes for å sende betalinger.
                        <!-- Velg 2-faktor autentisering for å øke sikkerheten. Vi vil da også trenge et mobilnummer. -->
                    </p>
                    <i class="material-icons" style="margin-bottom: 1rem;" [matTooltip]="passwordCriteriaMsg">
                        info
                    </i>
                    <section>
                        <label class="uni-label label-left">
                            <span>Passord</span>
                            <input type="password" autocomplete="new-password" [(ngModel)]="agreementDetails.Password">
                        </label>
                        <label class="uni-label label-left">
                            <span>Bekreft passord</span>
                            <input type="password" autocomplete="new-password" [(ngModel)]="agreementDetails._confirmPassword">
                        </label>
                    </section>
                    <!-- HIDE THIS UNTIL 2-FACTOR IS READY FOR PROD -->
                    <span style="font-weight: 400; margin: 1rem 0 1rem 9.5rem;" *ngIf="false">
                        <span style="color: #9198aa;">
                            2-faktor autentisering
                            <i class="material-icons two-factor-tooltip" matTooltip="{{ twoFactorMsg }}">
                                info
                            </i>
                            <div class="payments-checkboxes">
                                <div>
                                    <i class="material-icons" (click)="useTwoFactor = !useTwoFactor">
                                        {{ useTwoFactor ? 'check_box' : 'check_box_outline_blank' }}
                                    </i>
                                    <span>Slå på 2-faktor</span>
                                </div>
                            </div>
                        </span>
                    </span>
                    <section *ngIf="useTwoFactor">
                        <label class="uni-label label-left">
                            <span>Telefonr</span>
                            <input type="text" [(ngModel)]="agreementDetails.Phone">
                        </label>
                    </section>
                </article>
                <article class="uni-autobank-agreement-modal-body" *ngIf="steps === 5 && hasAgreements" id="step5"
                    style="width: 75%; display: flex; justify-content: center; flex-direction: column; margin: 0 auto;">
                    <span style="color: #9198aa; margin: 0 0 .8rem 9.5rem;">
                        Bekreft eksisterende autobankpassord
                    </span>
                    <section class="uni-html-form bank-agreement-password-form">
                        <label>
                            <span>Passord</span>
                            <input type="password" autocomplete="new-password" [(ngModel)]="agreementDetails.Password">
                        </label>
                    </section>
                </article>
                <article class="uni-autobank-agreement-modal-body" *ngIf="steps === 6" id="step6"
                    style="width: 65%; display: flex; justify-content: center; text-align: center; flex-direction: column; margin: 0 auto;">
                    <i class="material-icons" style="color: #7bcb45; font-size: 5rem; text-align: center;">check_circle</i>
                    <h3>Avtale opprettet </h3>
                    <p>
                        Du har nå fullført din del av opprettelse av autobankavtale. Nå setter vi opp alt med banken.
                        Status på avtalen kan du sjekke forløpende ved å trykke på linken "Mine avtaler" over knappen
                        "Ny autobankavtale" i bankbilde.
                    </p>
                </article>
                <footer>
                    <span *ngIf="errorText"> {{ errorText }}</span>
                    <div>
                        <button *ngIf="steps > 0 && steps !== 6" (click)="move(-1)" class="secondary">
                            Tilbake
                        </button>
                        <button (click)="move(1)" class="c2a" [disabled]="buttonLock">
                            {{ steps === 5 || (steps === 4 && serviceProvider === 4) ? 'Opprett avtale' : steps === 6 || noAccounts ? 'Lukk' : 'Fortsett' }}
                        </button>
                    </div>
                </footer>
            </div>
        </section>
    `
})

export class UniAutobankAgreementModal implements IUniModal, OnInit {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    private accounts: any[] = [];
    private bankID: number = 0;
    serviceProvider: BankAgreementServiceProvider;
    agreements: any[] = [];
    bankAgreementUrl: SafeResourceUrl;

    usedBanks: string[] = [];
    buttonLock: boolean = false;
    hasAgreements: boolean = false;
    steps: number = 0;
    useTwoFactor: boolean = false;
    noAccounts: boolean = false;
    companySettings;
    errorText: string;
    infoTextForBalance: string = 'Ved aktivering av denne tjenesten vil dere motta transaksjoner fra deres bank ' +
    'for automatisk avstemming og oppdatert banksaldo i systemet.';

    header = 'Veiviser for ny autobankavtale';
    twoFactorMsg: string = '2-faktor bekreftelse (autentisering) er et ekstra sikkerhetsnivå for betaling. ' +
    'Med 2-faktor bekreftelse logger du inn med noe du vet (ditt passord) i tillegg til noe du får en kode på SMS.';
    passwordCriteriaMsg = `Passordet må være minst 10 tegn og inneholde en stor bokstav [A-Z], en liten bokstav [a-z], ett tall [0-9] og ett av ` +
    `disse tegnene: ! @ # $ % ^ & * _ - = + . : ? , ( ) [ ] { }`;

    agreementDetails: AutoBankAgreementDetails = {
        DisplayName: '',
        Phone: '',
        Email: '',
        Bank: '',
        Orgnr: '',
        BankAccountID: 0,
        BankAcceptance: true,
        IsInbound: true,
        IsOutgoing: true,
        IsBankBalance: true,
        BankApproval: true,
        IsBankStatement: true,
        Password: '',
        _confirmPassword: '',
        BankAccountNumber: 0,
        ServiceProvider: BankAgreementServiceProvider.ZData
    };

    formModel$: BehaviorSubject<AutoBankAgreementDetails> = new BehaviorSubject(null);
    formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    hasReadAgreement = false;

    constructor(
        private userService: UserService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private bankService: BankService,
        private elsaAgreementService: ElsaAgreementService,
        private sanitizer: DomSanitizer,
    ) { }

    public ngOnInit() {
        if (this.options && this.options.data && this.options.data.agreements) {
            this.hasAgreements = !!this.options?.data?.agreements && this.options?.data?.agreements?.length > 0;
            this.agreements = this.options.data.agreements.filter(a => a.StatusCode === StatusCodeBankIntegrationAgreement.Active);
        }

        if (this.hasAgreements) {
            this.serviceProvider =
                this.agreements.filter(x => x.ServiceProvider === BankAgreementServiceProvider.ZdataV3)[0]?.ServiceProvider
                ?? this.agreements[0].ServiceProvider;
        } else {
            this.bankService.getDefaultServiceProvider().subscribe(serviceProvider => {
                this.serviceProvider = serviceProvider;
                this.agreementDetails.ServiceProvider = serviceProvider;
            });
        }

        Observable.forkJoin([
            this.companySettingsService.Get(1, ['BankAccounts.Bank', 'BankAccounts.Account']),
            this.userService.getCurrentUser(),
            this.elsaAgreementService.getByType('Bank')
        ]).subscribe(([settings, user, elsaAgreement]) => {

            this.companySettings = settings;
            this.accounts = [];

            // Filter out the accounts of banks already in use
            this.usedBanks = [];
            if (this.agreements.length) {
                this.agreements.forEach(agr => {
                    if (this.usedBanks.findIndex(name => name === agr.BankAccount.Bank.Name) < 0 ) {
                        this.usedBanks.push(agr.BankAccount.Bank.Name);
                    }
                });
            }

            this.companySettings.BankAccounts.forEach(acc => {
                if (!this.usedBanks.filter(name => acc.Bank && name === acc.Bank.Name).length) {
                    if (acc.Bank) {
                        this.accounts.push(acc);
                    }
                }
            });

            if (!this.accounts.length) {
                this.errorText = 'Det ser ut som at du har autobankavtale for alle bankene registrert i firmaoppsettet. ' +
                'Om du har en konto i ny bank, registrer konto i firmaoppsettet først.';
                this.noAccounts = true;
            }

            this.agreementDetails.Orgnr = settings.OrganizationNumber;
            this.agreementDetails.Phone = user.PhoneNumber;
            this.agreementDetails.Email = user.Email;

            this.bankAgreementUrl = this.sanitizer.bypassSecurityTrustResourceUrl(elsaAgreement?.DownloadUrl);

            this.steps = 0;

            this.formModel$.next(this.agreementDetails);
            this.formFields$.next(this.getFormFields());
        }, (err) => {
            this.formModel$.next(this.agreementDetails);
            this.formFields$.next(this.getFormFields());
        });
    }

    ngOnDestroy() {
        this.formFields$.complete();
        this.formModel$.complete();
    }

    private getFormFields(): UniFieldLayout[] {
        const bankAccountField = new UniFieldLayout();
        bankAccountField.Property = 'BankAccountID';
        bankAccountField.FieldType = FieldType.DROPDOWN;
        bankAccountField.Label = 'Bankkonto';
        bankAccountField.Legend = 'Filter';
        bankAccountField.FieldSet = 0;
        bankAccountField.Placeholder = 'Bankkonto';
        bankAccountField.Options = {
            source: this.accounts,
            valueProperty: 'ID',
            template: (item) => {
                let returnString = item !== null  ? item.AccountNumber : '';
                returnString += !!item.Bank ? ' - ' + item.Bank.Name : '';
                return returnString;
            },
            hideDeleteButton: true,
            debounceTime: 200
        };
        return [
            <any> {
                Property: 'Bank',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Bank',
            },
            bankAccountField,
            <any> {
                Property: 'Phone',
                FieldType: FieldType.TEXT,
                Label: 'Telefon',
            }
        ];
    }

    public move(direction: number) {
        // Go backwards
        if (direction < 0) {
            if (this.steps === 4 && this.serviceProvider === BankAgreementServiceProvider.ZData) {
                this.steps -= 2;
            } else  {
                this.steps--;
            }
            this.errorText = '';
            this.buttonLock = false;
            return;
        }

        if (this.steps === 6 || this.noAccounts) {
            this.close();
        }

        // Bank agreement step
        if (this.steps === 2 && !this.hasReadAgreement) {
            return;
        }

        // Full form step
        if (this.steps === 4) {
            if (!this.validateForm()) {
                return;
            }
            if (this.serviceProvider === BankAgreementServiceProvider.ZdataV3) {
                if (this.useTwoFactor && !this.agreementDetails.Phone) {
                    this.errorText = 'Mangler telefonnr. Du må fylle inn et gyldig telefonnr når du har valgt 2-faktor autentisering.';
                    return;
                } else {
                    this.errorText = '';
                }
                this.sendStartDataToZData();
                return;
            }
        }

        // Password step
        if (this.steps === 5 && this.hasAgreements) {
            this.bankService.validateAutobankPassword(this.agreementDetails.Password).subscribe(isCorrectPassword => {
                if (!isCorrectPassword) {
                    this.errorText = 'Feil passord!';
                    return;
                } else {
                    this.errorText = '';
                }
                this.sendStartDataToZData();
                return;
            });
        }

        if (this.steps === 5 && !this.hasAgreements) {
            if (!this.isValidPassword(this.agreementDetails)) {
                return;
            }

            // Has activated 2-factor, check phonenumber
            if (this.useTwoFactor && !this.agreementDetails.Phone) {
                this.errorText = 'Mangler telefonnr. Du må fylle inn et gyldig telefonnr når du har valgt 2-faktor autentisering.';
                return;
            } else {
                this.errorText = '';
            }
            this.sendStartDataToZData();
            return;
        }
        if (this.steps === 2 && this.serviceProvider === BankAgreementServiceProvider.ZData) {
            this.steps += 2;
        } else if (this.steps < 5) {
            this.steps++;
        }
    }

    public sendStartDataToZData() {
        this.buttonLock = true;
        this.agreementDetails.IsBankStatement = this.agreementDetails.IsBankBalance;
        this.bankService.createAutobankAgreement(this.agreementDetails).subscribe((result) => {

            if (!this.agreementDetails.BankApproval) {
                this.bankService.orderPreApprovedBankPayments(this.bankID).subscribe();
            }
            this.buttonLock = false;
            this.steps = 6;
        }, (err) => {
            this.buttonLock = false;
            this.errorService.handle(err);
        });
    }

    public close(value: boolean = true) {
        this.onClose.emit(value);
    }

    public onFormChange(event) {
        if (event.BankAccountID) {
            const account = this.accounts.filter(item => item.ID === event.BankAccountID.currentValue);
            this.agreementDetails.BankAccountNumber = account[0].AccountNumber || null;
            if (account.length > 0 && account[0] && account[0].Bank) {
                this.agreementDetails.Bank = account[0].Bank.Name;
                this.bankID = account[0].BankID;
                this.formModel$.next(this.agreementDetails);
            } else {
                this.agreementDetails.Bank = '';
                this.formModel$.next(this.agreementDetails);
            }
        }

        if (event.Orgnr) {
            // trim whitespace
            this.agreementDetails.Orgnr = (this.agreementDetails.Orgnr || '').split(' ').join('');
            this.formModel$.next(this.agreementDetails);
        }

        this.agreementDetails = this.formModel$.getValue();
    }

    private validateForm(): boolean {
        this.errorText = '';

        if (!this.agreementDetails.Bank) {
            this.errorText = 'Mangler bank.';
            return false;
        }

        if (!this.agreementDetails.Phone || !this.isValidPhoneNumber(this.agreementDetails.Phone)) {
            this.errorText = 'Telefonnummer må være et gyldig norsk nummer';
            return false;
        }

        // trim whitespace from org.nr
        const validOrgNr = this.agreementDetails.Orgnr !== ''
            && !isNaN(parseInt(this.agreementDetails.Orgnr, 10))
            && this.agreementDetails.Orgnr.length === 9;

        if (!validOrgNr) {
            if (this.agreementDetails.Orgnr) {
                this.errorText = 'Ugyldig org.nr';
            }

            return false;
        }

        if (!this.agreementDetails.Email || !this.agreementDetails.Email.includes('@')) {
            if (this.agreementDetails.Email) {
                this.errorText = 'Ugyldig e-post';
            }
            return false;
        }

        if (!this.agreementDetails.IsInbound && !this.agreementDetails.IsOutgoing) {
            this.errorText = 'Du må krysse av for innbetalinger, utbetalinger eller begge.';
            return false;
        }

        return true;
    }

    private isValidPhoneNumber(phone) {
        const test1 = /^\d{8}$/.test(phone);
        const test2 = /^0047\d{8}$/.test(phone);
        const test3 = /^\+47\d{8}$/.test(phone);

        if (test1 || test2 || test3) {
            return true;
        } else {
            return false;
        }
    }

    private isValidPassword(agreementDetails: AutoBankAgreementDetails): boolean {
        const password = agreementDetails.Password;
        const confirmPassword = agreementDetails._confirmPassword;

        let numberOfMetCriterias = 0;
        numberOfMetCriterias += /[a-z]/.test(password) ? 1 : 0;
        numberOfMetCriterias += /[A-Z]/.test(password) ? 1 : 0;
        numberOfMetCriterias += /[\d]/.test(password) ? 1 : 0;
        numberOfMetCriterias += /[\@\#\$\%\^\&\*\-_\\+\=\[\]\{\}\:\,\.\?\!\`\(\)\;]/.test(password) ? 1 : 0;

        const passwordValid = numberOfMetCriterias === 4 && password.length >= 10;
        let passwordConfirmed: boolean;

        if (passwordValid) {
            if (password === confirmPassword) {
                this.errorText = '';
                passwordConfirmed = true;
            } else {
                if (confirmPassword) {
                    this.errorText = 'Passordene er ikke like';
                }

                passwordConfirmed = false;
            }
        } else {
            this.errorText = 'Ugyldig passord! ' + this.passwordCriteriaMsg;
        }

        return passwordValid && passwordConfirmed;
    }

    public saveAfterEdit() {
        // Save updated agreement details
        // TODO!
    }

}
