import {Component, Input, Output, EventEmitter, OnInit, ViewChild, HostListener} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {UniForm, FieldType} from '../../../../../framework/ui/uniform/index';
import {UniModalService} from '../../../../../framework/uni-modal';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'add-file-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign" style="width: 35vw; min-width: 640px;">
            <header>Innstillinger for smart bokføring</header>

            <article class="bill-container">
                <article class="bill-list">
                    <uni-form class="transquery-filter-form smart-booking-settings-form"
                        [config]="config$"
                        [fields]="fields$"
                        [model]="settings$">
                    </uni-form>

                </article>
            </article>

            <footer class="center">
                <button class="secondary" (click)="close()">Avbryt</button>
                <button class="c2a" (click)="close(true)">Lagre</button>
            </footer>
        </section>
    `
})

export class UniSmartBookingSettingsModal implements OnInit, IUniModal {

    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();

    settings$: BehaviorSubject<any> = new BehaviorSubject({});
    config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(
        private modalService: UniModalService
    ) {}

    public ngOnInit() {
        this.settings$.next(this.options.data.settings);
        this.fields$.next(this.getFields());
    }

    public getFields() {
        return [
            {
                Property: 'turnOnSmartBooking',
                FieldType: FieldType.CHECKBOX,
                Label: 'Kjør smart bokføring automatisk',
                Placeholder: '',
            },
            {
                Property: 'showNotification',
                FieldType: FieldType.CHECKBOX,
                Label: 'Vis varsler fra smart bokføring',
                Placeholder: 'Vis varsler',
            },
            // {
            //     Property: 'addNotifcationAsComment',
            //     FieldType: FieldType.CHECKBOX,
            //     Label: 'Lag kommentar av varsler',
            //     Placeholder: '',
            // }
        ];
    }

    public close(save: boolean = false) {
        this.onClose.emit(save ? this.settings$.getValue() : null);
    }
}
