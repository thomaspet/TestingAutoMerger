import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uniModal/barrel';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {
    UserService,
    ErrorService,
    CompanySettingsService,
    BankAccountService,
    BankService
} from '@app/services/services';
import {Observable} from 'rxjs/Observable';
import {BankAccount} from '@uni-entities';

export interface IAutoBankAgreementDetails {
    Orgnr: string;
    Email: string;
    Bank: string;
    Phone: string;
    BankAccountID: number;
    BankAcceptance: boolean;
    IsInbound: boolean;
    IsOutgoing: boolean;
    Password: string;
    BankAccountNumber: number;
    _confirmPassword?: string;
}

@Component({
    selector: 'uni-autobank-agreement-modal',
    template: `
        <section role="dialog" class="uni-modal uni-autobank-agreement-modal">
            <header><h1>{{ header }}</h1></header>

            <article class="uni-autobank-agreement-modal-body" [hidden]="steps > 0" id="step0">
                <p>Velkommen til veiviser for ny autobankavtale.</p>
                <p>
                For å komme i gang med autobank trenger vi informasjon fra dere for å koble opp mot deres bank.
                </p>
                <p>
                    Oppsettet mot de ulike bankene er ulikt, og for å sikre best mulig automasjon vil vi kunne trenge ekstra informasjon.
                    I slike tilfeller vil dere bli kontaktet av Uni Micro AS eller Zdata for å innhente nødvendig informasjon.
                </p>
            </article>
            <article class="uni-autobank-agreement-modal-body checkbox_step" [hidden]="steps !== 1" id="step1">
                <p>Kryss av for om du ønsker autobankavtale for utbetalinger, innbetallinger, eller begge: </p>
                <label class="checkbox-label" for="isIncommingCheckbox">
                    <input type="checkbox"
                        [(ngModel)]="agreementDetails.IsInbound"
                        (change)="onCheckboxChange()"
                        id="isIncommingCheckbox" />
                    Innbetalinger
                </label>
                <br>
                <label class="checkbox-label" for="isOutgoingCheckbox">
                    <input type="checkbox"
                        [(ngModel)]="agreementDetails.IsOutgoing"
                        (change)="onCheckboxChange()"
                        id="isOutgoingCheckbox" />
                    Utbetalinger
                </label>
            </article>
            <article class="uni-autobank-agreement-modal-body" [hidden]="steps !== 2" id="step2">
                <p *ngIf="!editmode">Vennligst full ut feltene under. Alle felt må være fylt ut for å fullføre oppsettet mot autobank</p>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$"
                    (changeEvent)="onFormChange($event)">
                </uni-form>
                <span *ngIf="errorText" style="font-size: .75rem; color: red; margin-left: 0.5rem;"> {{ errorText }}</span>
            </article>
            <article class="uni-autobank-agreement-modal-body" [hidden]="steps !== 3" id="step3" [attr.aria-busy]="busy">
                <p> Se over og sjekk at all informasjon stemmer føre dere velger fortsett
                    <strong>(NB! Informasjon sendes automatisk til din bank)</strong>
                </p>

                <h3> <strong>Orgnr: </strong> {{ agreementDetails.Orgnr }} </h3>
                <h3> <strong>Bankkonto: </strong> {{ agreementDetails.BankAccountNumber }} - {{ agreementDetails.Bank }} </h3>
                <h3> <strong>Manuell godkjenning i nettbank:  </strong> {{ agreementDetails.BankAcceptance ? 'Ja' : 'Nei' }} </h3>
                <h3> <strong>Avtale for innkommende betaling:  </strong> {{ agreementDetails.IsInbound ? 'Ja' : 'Nei' }} </h3>
                <h3> <strong>Avtale for utgående betaling:  </strong> {{ agreementDetails.IsOutgoing ? 'Ja' : 'Nei' }} </h3>
                <h3> <strong>Epost: </strong> {{ agreementDetails.Email }} </h3>
            </article>
            <article class="uni-autobank-agreement-modal-body" [hidden]="steps !== 4" id="step4">
                <p>Du har nå fullført din del av opprettelse av autobankavtale. Nå setter vi opp alt med banken.</p>
                <p>Status kan du sjekke forløpende ved å trykke på linken over knappen "Ny autobankavtale" i bankbilde,
                eller du kan gå inn under Innstillinger - Bankinstillinger.</p>
            </article>

            <footer *ngIf="!editmode">
                <button (click)="move(-1)" [disabled]="busy" *ngIf="steps > 0 && steps !== 4">
                    Tilbake
                </button>

                <button (click)="move(1)" *ngIf="steps < 3" [disabled]="busy || !canMoveForward">
                    Fortsett
                </button>

                <button (click)="sendStartDataToZData()" *ngIf="steps === 3" class="good" [disabled]="busy">
                    Fullfør
                </button>

                <button (click)="close('cancel')" class="bad">Lukk</button>
            </footer>
            <footer *ngIf="editmode">
                <button (click)="saveAfterEdit()" class="good">Lagre</button>
                <button (click)="close('cancel')" class="bad">Avbryt</button>
            </footer>
        </section>
    `
})

export class UniAutobankAgreementModal implements IUniModal, OnInit {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    private steps: number = 0;
    private canMoveForward: boolean = true;
    private errorText: string;
    private accounts: any[] = [];
    private busy: boolean = false;
    private header = 'Veiviser for ny autobankavtale';
    private agreementDetails: IAutoBankAgreementDetails = {
        Phone: '',
        Email: '',
        Bank: '',
        Orgnr: '',
        BankAccountID: 0,
        BankAcceptance: true,
        IsInbound: false,
        IsOutgoing: false,
        Password: '',
        BankAccountNumber: 0
    };

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    private formModel$: BehaviorSubject<IAutoBankAgreementDetails> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public editmode: boolean = false;

    constructor(
        private userService: UserService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private bankAccountService: BankAccountService,
        private bankService: BankService
    ) { }

    public ngOnInit() {
        if (this.options && this.options.data) {
            this.agreementDetails = this.options.data;
            this.editmode = true;
            this.steps = 2;
            this.header = 'Rediger avtale';
        }
        Observable.forkJoin(
            this.companySettingsService.Get(1),
            this.userService.getCurrentUser(),
            this.bankAccountService.GetAll(`filter=(BankAccountType ne 'Customer' and BankAccountType ne 'Supplier')`, ['Bank'])
        ).subscribe((res) => {
            this.accounts = res[2];
            // If not agreement is passed in as Input
            if (!this.editmode) {
                this.agreementDetails.Orgnr = res[0].OrganizationNumber;
                this.agreementDetails.Phone = res[1].PhoneNumber;
                this.agreementDetails.Email = res[1].Email;
                this.steps = 0;
            }
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
                Property: 'Orgnr',
                FieldType: FieldType.TEXT,
                Label: 'Orgnr.',
                Hidden: this.editmode
            },
            <any> {
                Property: 'Bank',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Bank',
            },
            bankAccountField,
            <any> {
                Property: 'IsInbound',
                FieldType: FieldType.CHECKBOX,
                Label: 'Innkommende',
                Hidden: !this.editmode
            },
            <any> {
                Property: 'IsOutgoing',
                FieldType: FieldType.CHECKBOX,
                Label: 'Utgående',
                Hidden: !this.editmode
            },
            <any> {
                Property: 'Phone',
                FieldType: FieldType.TEXT,
                Label: 'Telefon',
            },
            <any> {
                Property: 'Email',
                FieldType: FieldType.TEXT,
                Label: 'Epost',
            },
            <any> {
                Property: 'Password',
                FieldType: FieldType.PASSWORD,
                Label: 'Passord',
                Hidden: this.editmode
            },
            <any> {
                Property: '_confirmPassword',
                FieldType: FieldType.PASSWORD,
                Label: 'Bekreft passord',
                Hidden: this.editmode
            }
        ];
    }

    public move(direction: number) {
        this.steps += direction;
        this.canMoveForward = this.steps !== 1 ;

        // Form step
        if (this.steps === 1) {
            this.canMoveForward = this.agreementDetails.IsInbound || this.agreementDetails.IsOutgoing;
        } else if (this.steps === 2) {
            this.canMoveForward = this.validateForm();
        } else if (this.steps === 3) {
            this.canMoveForward = false;
        }
    }

    public sendStartDataToZData() {
        this.busy = true;
        this.bankService.createAutobankAgreement(this.agreementDetails).subscribe((result) => {
            this.busy = false;
            this.steps++;
        }, (err) => {
            this.canMoveForward = true;
            this.busy = false;
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
        this.canMoveForward = this.validateForm();
    }

    public onCheckboxChange() {
        this.canMoveForward = this.agreementDetails.IsInbound || this.agreementDetails.IsOutgoing;
    }

    private validateForm(): boolean {
        this.errorText = '';

        if (!this.agreementDetails.Bank) {
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

        if (!this.agreementDetails.Phone) {
            return false;
        }

        if (!this.agreementDetails.Email || !this.agreementDetails.Email.includes('@')) {
            if (this.agreementDetails.Email) {
                this.errorText = 'Ugyldig epost';
            }
            return false;
        }

        if (!this.validatePassword(this.agreementDetails)) {
            // Validate function sets error message
            return false;
        }

        return true;
    }

    private validatePassword(agreementDetails: IAutoBankAgreementDetails): boolean {
        const password = this.agreementDetails.Password;
        const confirmPassword = this.agreementDetails._confirmPassword;

        if (!password) {
            return false;
        }

        let numberOfMetCriterias = 0;
        numberOfMetCriterias += /[a-zæøå]/.test(password) ? 1 : 0;
        numberOfMetCriterias += /[A-ZÆØÅ]/.test(password) ? 1 : 0;
        numberOfMetCriterias += /[\d]/.test(password) ? 1 : 0;
        numberOfMetCriterias += /[\@\#\$\%\^\&\*\-_\\+\=\[\]\{\}\|\\\:\‘\,\.\?\/\`\~\“\(\)\;]/.test(password) ? 1 : 0;

        const passwordValid = numberOfMetCriterias >= 3;
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
            this.errorText = 'Ugyldig passord! Passordet må ha minst 3 av 4 av kriteriene: Stor bokstav, liten bokstav, tall og tegn';
        }

        return passwordValid && passwordConfirmed;
    }

    public saveAfterEdit() {
        // Save updated agreement details
        // TODO!
    }

}

