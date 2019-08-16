import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {JournalEntryLine, Dimensions} from '../../../app/unientities';

import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import {KeyCodes} from '../../../app/services/common/keyCodes';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {ErrorService, StatisticsService, JournalEntryLineService} from '@app/services/services';
import { parse } from 'qs';

@Component({
    selector: 'journalentry-line-modal',
    template: `
            <section role="dialog" class="uni-modal">
            <header>
                <h1>Redigere bilagslinje ( uten kreditering )</h1>
            </header>
            <article>
                Disse endringene vil ikke medføre en kreditering eller korrigering, <BR/>
                men vil bli endret direkte på bilagslinjen.<BR/><BR/>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>
            <footer>
                <button class="good" (click)="close(true)">Lagre</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniJournalEntryLineModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter<string>();

    @Input()
    public modalService: UniModalService;

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public formModel$: BehaviorSubject<JournalEntryLine> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    private journalEntryLine: JournalEntryLine;


    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private journalEntryLineService: JournalEntryLineService
    ) {}

    public ngOnInit() {

        this.journalEntryLineService.Get(this.options.data.journalEntryLine.ID, ['Dimensions', 'JournalEntryType']).subscribe((line) => {
            this.journalEntryLine = line;
            this.formModel$.next(this.journalEntryLine);
            this.formFields$.next(this.getFormFields());
        });
    }

    public close(emitValue?: boolean) {
       if (emitValue) {
            const jel: JournalEntryLine = this.journalEntryLine;
            const jelType = jel.JournalEntryType;
            if (jelType && jelType.ID !== jel.JournalEntryTypeID) {
                jel.JournalEntryTypeID = jelType.ID;
            }

            const jelToSave: any = new JournalEntryLine();
            jelToSave.ID = jel.ID;
            jelToSave.Description = jel.Description;
            jelToSave.PaymentID = jel.PaymentID;
            jelToSave.JournalEntryTypeID = jel.JournalEntryTypeID || jel.JournalEntryType;

            this.journalEntryLineService.Put(jelToSave.ID, jelToSave).subscribe((res) => {
                this.onClose.emit(jel);
            });
        } else {
            this.onClose.emit(null);
        }
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                Property: 'Description',
                FieldType: FieldType.TEXT,
                Label: 'Beskrivelse',
            },
            <any> {
                Property: 'PaymentID',
                FieldType: FieldType.TEXT,
                Label: 'KID',
            },
            <any> {
                Property: 'JournalEntryType',
                FieldType: FieldType.DROPDOWN,
                Label: 'Bilagstype',
                Options: {
                    valueProperty: 'ID',
                    displayProperty: 'DisplayName',
                    search: (query) => {

                        let searchString = `model=JournalEntryType&select=DisplayName as DisplayName,ID as ID&filter=ID gt 5 and startswith(DisplayName\,'${query}')`;
                        return this.statisticsService
                        .GetAll(searchString).map(x => x.Data ? x.Data : []);
                    }
                }
            }
        ];
    }
}

