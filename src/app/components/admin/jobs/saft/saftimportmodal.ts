import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';

import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'saft-import-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options.header || 'Innstillinger'}}</header>
            <article>
                <p>Starte import av '{{options.data?.file?.FileName}}' ?</p>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <table class="full"><tr>
                <td class="left">
                    <div class="warn">Du kan lese inn filen flere ganger dersom det skulle oppstå problemer.</div>
                </td>
                <td class="right nowrap">
                    <button class="good" (click)="close(true)">Ok</button>
                    <button class="bad" (click)="close(false)">Avbryt</button>
                </td>
                </tr></table>
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
    public formModel$: BehaviorSubject<any> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public ngOnInit() {
        const value = this.options.data || {};
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
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'Automark',
                FieldType: FieldType.CHECKBOX,
                Label: 'Automatisk merking av reskontroposter'
            }
        ];
    }
}
