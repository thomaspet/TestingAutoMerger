import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {Bank} from '../../../app/unientities';

import {BehaviorSubject} from 'rxjs';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {ErrorService, BankService} from '@app/services/services';

@Component({
    selector: 'uni-bank-modal',
    template: `
            <section role="dialog" class="uni-modal">
            <header>Bank</header>
            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>
            <footer>
                <button class="good" (click)="close(true)">Ok</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniBankModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter<string>();

    @Input()
    public modalService: UniModalService;

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public formModel$: BehaviorSubject<Bank> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    constructor(
        private bankService: BankService,
        private errorService: ErrorService,
        private toastService: ToastService
    ) {}

    public ngOnInit() {
        const bankData = this.options.data || '';
        bankData.InitialBIC = bankData.InitialBIC || bankData.BIC;
        this.formModel$.next(bankData);
        this.formFields$.next(this.getFormFields());
    }

    public close(emitValue?: boolean) {
        if (emitValue) {
            const data: Bank = this.formModel$.getValue();
            if (data && data.BIC && data.Name) {
                if (data.ID) {
                    if (!data.AddressID && data.Address) {
                        data.Address._createguid = this.bankService.getNewGuid();
                    }
                    if (!data.PhoneID && data.Phone) {
                        data.Phone._createguid = this.bankService.getNewGuid();
                    }
                    if (!data.EmailID && data.Email) {
                        data.Email._createguid = this.bankService.getNewGuid();
                    }
                    this.bankService.Put<Bank>(data.ID, data).subscribe(res => {
                        this.toastService.addToast('Bank oppdatert', ToastType.good, 4);
                        this.onClose.emit(res);
                    });
                } else {
                    data.InitialBIC = data.BIC;
                    this.bankService.Post<Bank>(data).subscribe(res => {
                        this.toastService.addToast('Ny bank lagret', ToastType.good, 4);
                        this.onClose.emit(res);
                    });
                }
            } else {
                this.toastService.addToast('Mangler Banknavn eller BIC!', ToastType.bad, 5, 'Du må oppgi Banknavn og BIC for Banken.') ;
                return;
            }
        } else {
            this.onClose.emit();
        }
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                Property: 'BIC',
                FieldType: FieldType.TEXT,
                Label: 'BIC',
            },
            <any> {
                Property: 'Name',
                FieldType: FieldType.TEXT, //todo make autocomplete
                Label: 'Banknavn',
            },
            <any> {
                Property: 'Web',
                FieldType: FieldType.URL,
                Label: 'Hjemmeside',
                LineBreak: true,
            },
            <any> {
                Property: 'Email.EmailAddress',
                FieldType: FieldType.TEXT,
                Label: 'E-post',
            },
            <any> {
                Property: 'Address.AddressLine1',
                FieldType: FieldType.TEXT,
                Label: 'Adresse',
            },
            <any> {
                Property: 'Address.PostalCode',
                FieldType: FieldType.TEXT,
                Label: 'Postnr',
            },
            <any> {
                Property: 'Address.City',
                FieldType: FieldType.TEXT,
                Label: 'Poststed',
            },
            <any> {
                Property: 'Address.Country',
                FieldType: FieldType.TEXT,
                Label: 'Country',
            },
            <any> {
                Property: 'Phone.Number',
                FieldType: FieldType.TEXT,
                Label: 'Telefonnummer'
            }
        ];
    }
}
