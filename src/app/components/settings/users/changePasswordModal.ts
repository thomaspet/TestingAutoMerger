import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {IUniModal, IModalOptions} from '../../../../framework/uni-modal';
import {UniField, FieldType} from '../../../../framework/ui/uniform/index';
import {FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

interface IChangePasswordFields {
    OldPass: string;
    NewPass: string;
    ConfirmPass: string;
}

@Component({
    selector: 'uni-template-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 40vw;">
            <header><h1>{{ options.header }}</h1></header>

            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <button (click)="okClicked()" class="good">Lagre</button>
                <button (click)="close()" class="bad">Avbryt</button>
            </footer>
        </section>
`
})

export class UniChangePasswordModal implements IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    private formModel$: BehaviorSubject<IChangePasswordFields> = new BehaviorSubject(null);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private formFields$: BehaviorSubject<UniField[]> = new BehaviorSubject([]);

    private passes: IChangePasswordFields = {
        OldPass: '',
        NewPass: '',
        ConfirmPass: ''
    };

    constructor(private toastService: ToastService) { }

    public ngOnInit() {
        this.setUpForm();
    }

    private setUpForm() {
        this.formFields$.next([
            <any> {
                EntityType: 'Settings',
                Property: 'OldPass',
                FieldType: FieldType.PASSWORD,
                Label: 'Gammelt passord',
                FieldSet: 0,
                Section: 0
            },
            <any> {
                EntityType: 'Settings',
                Property: 'NewPass',
                FieldType: FieldType.PASSWORD,
                Label: 'Nytt passord',
                FieldSet: 0,
                Section: 0
            },
            <any> {
                EntityType: 'Settings',
                Property: 'ConfirmPass',
                FieldType: FieldType.PASSWORD,
                Label: 'Gjenta passord',
                FieldSet: 0,
                Section: 0
            }]
        );

        this.formModel$.next(this.passes);
    }

    public okClicked() {
        if (this.passes.NewPass === this.passes.ConfirmPass) {
            this.onClose.emit(this.formModel$.getValue());
        } else {
            this.toastService.addToast('De nye passordene må være like', ToastType.bad, 10);
        }
    }

    public close() {
        this.onClose.emit(false);
    }
}
