import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {ToastService} from '../../uniToast/toastService';
import {
    ErrorService,
    BankFileDownloadService
} from '../../../../src/app/services/services';
import {BehaviorSubject} from 'rxjs';

@Component({
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options.header || 'Hent bankfiler'}}</header>
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
    public onClose: EventEmitter<string> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<Object> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public isLoading: boolean = false;

    public isEmpty: boolean;

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
                // this.toastService.addToast(
                //     'Bankfilene er hentet.',
                //     ToastType.good,
                //     5
                // );
                this.onClose.emit('Bankfilene er hentet.');
            }, err => {
                this.isLoading = false;
                // this.toastService.addToast(
                //     'Kunne ikke hente bankfiler',
                //     ToastType.bad,
                //     5
                // );
                // this.errorService.handle(err);
                this.onClose.emit('Kunne ikke hente bankfiler',);
            });
        } else {
            this.isEmpty  = true;
        }
    }

    public onBadClick() {
        this.onClose.emit('Henting av bankfiler avbrutt.');
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
