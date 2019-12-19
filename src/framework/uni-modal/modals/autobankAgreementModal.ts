import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {BehaviorSubject} from 'rxjs';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {
    UserService,
    ErrorService,
    CompanySettingsService,
    BankService
} from '@app/services/services';
import {Observable} from 'rxjs';

export interface IAutoBankAgreementDetails {
    Orgnr: string;
    Email: string;
    Bank: string;
    Phone: string;
    BankAccountID: number;
    BankAcceptance: boolean;
    IsBankBalance: boolean;
    BankApproval: boolean;
    IsBankStatement: boolean;
    IsInbound: boolean;
    IsOutgoing: boolean;
    BankApproval: boolean;
    Password: string;
    BankAccountNumber: number;
    _confirmPassword?: string;
}

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
            <i class="material-icons close-bankagreement-button" (click)="close()"> close </i>
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
                    <li>
                        <span [class.is-active-step]="steps === 3">  </span>
                        <div [class.is-active-step]="steps === 3"> Bankoppsett </div>
                    </li>
                    <li>
                        <span [class.is-active-step]="steps === 4">  </span>
                        <div [class.is-active-step]="steps === 4"> Sikkerhet </div>
                    </li>
                    <li>
                        <span [class.is-active-step]="steps === 5">  </span>
                        <div [class.is-active-step]="steps === 5"> Ferdigstilling </div>
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

                <article *ngIf="steps === 2" class="uni-autobank-agreement-modal-body checkbox_step" id="step2">
                    <object data="https://public-files.unieconomy.no/files/license/Bankavtale.pdf#zoom=100" type="application/pdf">
                        <a href="https://public-files.unieconomy.no/files/license/Bankavtale.pdf">Avtalevilkår</a>
                    </object>
                    <br>
                    <label class="checkbox-label" for="agreementCheckbox">
                        <input type="checkbox" [(ngModel)]="haveReadAgreement" id="agreementCheckbox"/>
                        Godta vilkår og avtaler
                    </label>
                </article>

                <article class="uni-autobank-agreement-modal-body" *ngIf="steps === 3" id="step3"
                    style="width: 75%; display: flex; justify-content: center; flex-direction: column; margin: 0 auto;">
                    <uni-form
                        style="font-size: .9rem; width: 80%"
                        [config]="formConfig$"
                        [fields]="formFields$"
                        [model]="formModel$"
                        (changeEvent)="onFormChange($event)">
                    </uni-form>
                    <span style="font-weight: 400; margin: 1rem 0 1rem .5rem;">
                        <span style="color: #9198aa;">Marker for å ta med i avtale:</span>
                        <div class="payments-checkboxes">
                            <div>
                                <i class="material-icons" (click)="agreementDetails.IsInbound = !agreementDetails.IsInbound">
                                    {{ agreementDetails.IsInbound ? 'check_box' : 'check_box_outline_blank' }}
                                </i>
                                <span>Innbetalinger</span>
                            </div>
                            <div>
                                <i class="material-icons" (click)="agreementDetails.IsOutgoing = !agreementDetails.IsOutgoing">
                                    {{ agreementDetails.IsOutgoing ? 'check_box' : 'check_box_outline_blank' }}
                                </i>
                                <span>Utbetalinger</span>
                            </div>
                            <div>
                                <i class="material-icons" (click)="agreementDetails.IsBankBalance = !agreementDetails.IsBankBalance">
                                    {{ agreementDetails.IsBankBalance ? 'check_box' : 'check_box_outline_blank' }}
                                </i>
                                <span style="display: flex; align-items: center;">
                                    Banksaldo + avstemming
                                    <i class="material-icons"
                                        matTooltip="{{ infoTextForBalance }}"
                                        style="margin-left: 1rem; font-size: 20px; color: #8c93a7">
                                        info
                                    </i>
                                </span>
                            </div>
                        </div>
                    </span>
                </article>

                <article class="uni-autobank-agreement-modal-body" *ngIf="steps === 4 && !hasAgreements" id="step4"
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

                <article class="uni-autobank-agreement-modal-body" *ngIf="steps === 4 && hasAgreements" id="step4"
                    style="width: 75%; display: flex; justify-content: center; flex-direction: column; margin: 0 auto;">

                    <span style="color: #9198aa; margin: 0 0 .8rem 9.5rem;">
                        Bekreft eksisterende passord
                    </span>

                    <section class="uni-html-form bank-agreement-password-form">
                        <label>
                            <span>Passord</span>
                            <input type="password" autocomplete="new-password" [(ngModel)]="agreementDetails.Password">
                        </label>
                    </section>
                </article>

                <article class="uni-autobank-agreement-modal-body" *ngIf="steps === 5" id="step5"
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
                        <button *ngIf="steps > 0 && steps !== 5" (click)="move(-1)" class="bank-agreement-button back-button">
                            Tilbake
                        </button>
                        <button (click)="move(1)" class="bank-agreement-button forward-button" [disabled]="buttonLock">
                            {{ steps === 4 ? 'Opprett avtale' : steps === 5 || noAccounts ? 'Lukk' : 'Fortsett' }}
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
    private agreements: any[] = [];

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
    passwordCriteriaMsg = `Passordet må være minst 10 tegn og inneholde en stor bokstav, en liten bokstav, ett tall og ett av ` +
    `disse tegnene: ! @ # $ % ^ & * _ - = + . : ? , ( ) [ ] { }`;

    agreementDetails: IAutoBankAgreementDetails = {
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
        BankApproval: true,
        Password: '',
        _confirmPassword: '',
        BankAccountNumber: 0
    };

    formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    formModel$: BehaviorSubject<IAutoBankAgreementDetails> = new BehaviorSubject(null);
    formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    haveReadAgreement = false;

    constructor(
        private userService: UserService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private bankService: BankService
    ) { }

    public ngOnInit() {
        if (this.options && this.options.data && this.options.data.agreements) {
            this.agreements = this.options.data.agreements;
            this.hasAgreements = !!this.agreements && this.agreements.length > 0;
        }

        Observable.forkJoin(
            this.companySettingsService.Get(1, ['BankAccounts.Bank', 'BankAccounts.Account']),
            this.userService.getCurrentUser()
        ).subscribe((res) => {

            this.companySettings = res[0];
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

            this.agreementDetails.Orgnr = res[0].OrganizationNumber;
            this.agreementDetails.Phone = res[1].PhoneNumber;
            this.agreementDetails.Email = res[1].Email;
            this.steps = 0;

            this.formModel$.next(this.agreementDetails);
            this.formFields$.next(this.getFormFields());
        }, (err) => {
            this.formModel$.next(this.agreementDetails);
            this.formFields$.next(this.getFormFields());
        });
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
            this.steps--;
            this.errorText = '';
            this.buttonLock = false;
            return;
        }

        if (this.steps === 5 || this.noAccounts) {
            this.close();
        }

        // Bank agreement step
        if (this.steps === 2 && !this.haveReadAgreement) {
            return;
        }

        // Full form step
        if (this.steps === 3) {
            if (!this.validateForm()) {
                return;
            }
        }

        // Password step
        if (this.steps === 4 && this.hasAgreements) {
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

        if (this.steps === 4 && !this.hasAgreements) {
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
        if (this.steps < 4) {
            this.steps++;
        }
    }

    public sendStartDataToZData() {
        this.buttonLock = true;
        this.agreementDetails.IsBankStatement = this.agreementDetails.IsBankBalance;
        this.bankService.createAutobankAgreement(this.agreementDetails).subscribe((result) => {
            this.buttonLock = false;
            this.steps++;
        }, (err) => {
            this.buttonLock = false;
            this.errorService.handle(err);
        });
    }

    public close() {
        this.onClose.emit(true);
    }

    public onFormChange(event) {
        if (event.BankAccountID) {
            const account = this.accounts.filter(item => item.ID === event.BankAccountID.currentValue);
            this.agreementDetails.BankAccountNumber = account[0].AccountNumber || null;
            if (account.length > 0 && account[0] && account[0].Bank) {
                this.agreementDetails.Bank = account[0].Bank.Name;
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

    private isValidPassword(agreementDetails: IAutoBankAgreementDetails): boolean {
        const password = agreementDetails.Password;
        const confirmPassword = agreementDetails._confirmPassword;

        let numberOfMetCriterias = 0;
        numberOfMetCriterias += /[a-zæøå]/.test(password) ? 1 : 0;
        numberOfMetCriterias += /[A-ZÆØÅ]/.test(password) ? 1 : 0;
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

