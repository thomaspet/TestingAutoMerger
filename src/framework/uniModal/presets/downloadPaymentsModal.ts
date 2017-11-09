import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '../modalService';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {ToastService, ToastType} from '../../uniToast/toastService';
import {
    ErrorService,
    BankFileDownloadService
} from '../../../../src/app/services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Hent bankfiler'}}</h1>
            </header>
            <article class="downloadPaymentsModal" [attr.aria-busy]="isLoading">
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <span class="warn" *ngIf="isEmpty">Passordet kan ikke være tomt</span>
                <button class="good" (click)="onGoodClick()">Hent bankfiler</button>
                <button class="bad" (click)="onBadClick()">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniDownloadPaymentsModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private formModel$: BehaviorSubject<Object> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    private isLoading: boolean = false;

    private isEmpty: boolean;

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService,
        private bankFileDownloadService: BankFileDownloadService
    ) {}

    public ngOnInit() {
        this.formFields$.next(this.getFormFields());
        this.initFormModel();
    }

    public initFormModel() {
        let model: Object = this.options.data || { Password: '' };
        this.formModel$.next(model);
    }

    public onGoodClick() {
        const model = this.formModel$.getValue();
        if (model['Password']) {
            this.isLoading = true;
            this.bankFileDownloadService.DownloadBankFiles(model['Password']).subscribe((res) => {
                this.isLoading = false;
                this.toastService.addToast(
                    'Bankfilene er hentet.',
                    ToastType.good,
                    5
                );
                this.onClose.emit();
            }, err => {
                this.isLoading = false;
                this.toastService.addToast(
                    'Kunne ikke hente bankfiler',
                    ToastType.bad,
                    5
                );
                this.errorService.handle(err);
                this.onClose.emit();
            });
        } else {
            this.isEmpty  = true;
        }
    }

    public onBadClick() {
        this.onClose.emit();
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                EntityType: '',
                Property: 'Password',
                FieldType: FieldType.PASSWORD,
                Label: 'Password'
            }
        ];
    }
}
