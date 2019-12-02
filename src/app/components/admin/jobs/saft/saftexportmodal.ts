import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';

import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'saft-export-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width:30vw">
            <header>{{options.header || 'Saft export'}}</header>
            <article>
                <p>Starte export</p>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
                <div class="warn">Du vil få epost med filen når eksporten er ferdig.</div>
            </article>

            <footer>
                <button class="good" (click)="close(true)">Ok</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class SaftExportModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<any> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public ngOnInit() {
        const value = this.options.data || {};
        this.formModel$.next(value);
        this.formFields$.next(this.getSaftExportFormFields());
    }

    public close(emitValue?: boolean) {
        this.onClose.emit(emitValue ? this.formModel$.getValue() : null);
    }

    private getSaftExportFormFields(): UniFieldLayout[] {
        return [
            <any> {
                EntityType: 'JobDetails',
                Property: 'FromYear',
                FieldType: FieldType.NUMERIC,
                Label: 'Fra regnskapsår'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'ToYear',
                FieldType: FieldType.NUMERIC,
                Label: 'Til regnskapsår'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'FromPeriod',
                FieldType: FieldType.NUMERIC,
                Label: 'Fra Periode'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'ToPeriod',
                FieldType: FieldType.NUMERIC,
                Label: 'Til Periode'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'Anonymous',
                FieldType: FieldType.CHECKBOX,
                Label: 'Anonymiser data'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'SendEmail',
                FieldType: FieldType.CHECKBOX,
                Label: 'Send meg epost med filen'
            }
        ];
    }
}
