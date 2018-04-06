import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'saft-import-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Innstillinger'}}</h1>
            </header>
            <article>
                <p>Starte import av '{{options.data?.file?.FileName}}' ?</p>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
                <p class="warn">PS! Du kan lese inn filen flere ganger dersom det skulle oppstå problemer.</p>
            </article>

            <footer>
                <button class="good" (click)="close(true)">Ok</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class SaftImportModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private formModel$: BehaviorSubject<any> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public ngOnInit() {
        let value = this.options.data || {};
        this.formModel$.next(value);
        this.formFields$.next(this.getFormFields());
    }

    public close(emitValue?: boolean) {
        let value: any;
        if (emitValue) {
            value = this.formModel$.getValue();
        }

        this.onClose.emit(value);
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                EntityType: 'JobDetails',
                Property: 'IncludeStartingBalance',
                FieldType: FieldType.CHECKBOX,
                Label: 'Opprett åpningsbalanse',
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'ReuseExistingNumbers',
                FieldType: FieldType.CHECKBOX,
                Label: 'Behold kunde- og leverandørnummer'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'UpdateExistingData',
                FieldType: FieldType.CHECKBOX,
                Label: 'Oppdater eksisterende kunder/leverandører'
            }
        ];
    }
}
