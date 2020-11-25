import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {JournalEntryLine, Dimensions, Project, Department, JournalEntryType} from '../../../app/unientities';
import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {ToastService} from '@uni-framework/uniToast/toastService';
import {
    ErrorService,
    StatisticsService,
    JournalEntryLineService,
    DimensionSettingsService,
    CustomDimensionService,
    DepartmentService,
    ProjectService
} from '@app/services/services';
import { theme, THEMES } from 'src/themes/theme';
​
@Component({
    selector: 'journalentry-line-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>Redigere bilagslinje ( uten kreditering )</header>
            <article>
                Disse endringene vil ikke medføre en kreditering eller korrigering, <BR/>
                men vil bli endret direkte på bilagslinjen.<BR/><BR/>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
                <uni-dimension-view
                    (entityChange)="onDataChange($event)"
                    [dimensionTypes]="dimensionTypes"
                    [entity]="journalEntryLine"
                    [entityType]="entityType"
                    [isModal]="true">
                </uni-dimension-view>
​
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
​
    @Output()
    public onClose: EventEmitter<any> = new EventEmitter<string>();
​
    @Input()
    public modalService: UniModalService;
    public dimensionTypes: any[];
    public projects: Project[];
    public departments: Department[];
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public formModel$: BehaviorSubject<JournalEntryLine> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public journalEntryLine: JournalEntryLine;
    public entityType: string = 'JournalEntryLine';
    private customDimensions: any;
​
    private jeTypes: JournalEntryType[];
​
    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private journalEntryLineService: JournalEntryLineService,
        private dimensionSettingsService: DimensionSettingsService,
        private customDimensionService: CustomDimensionService,
        private departmentService: DepartmentService,
        private projectService: ProjectService
    ) {}
​
    public ngOnInit() {
​

        Observable.forkJoin(
            this.journalEntryLineService.Get(this.options.data.journalEntryLine.ID, ['Dimensions', 'JournalEntryType']),
            this.projectService.GetAll(),
            this.departmentService.GetAll(),
            this.dimensionSettingsService.GetAll(null),
            this.statisticsService
                .GetAll('model=JournalEntryType&select=DisplayName as DisplayName,ID as ID&filter=ID gt 5')
                .map(x => x.Data ? x.Data : [])
        ).subscribe(data => {
            this.journalEntryLine = data[0];
            this.projects = data[1];
            this.departments = data[2];
            this.customDimensions = data[3];
            data[4].push({'DisplayName': '- Ikke valgt', ID: -1}); // ID skal være null, men da vises denne default, selv om annen type er valgt
            this.jeTypes = data[4].sort((a, b) => a.DisplayName > b.DisplayName ? 1 : -1);
            this.setUpDims(this.customDimensions);
            this.formModel$.next(this.journalEntryLine);
            this.formFields$.next(this.getFormFields());
        });
    }
​
    public close(emitValue?: boolean) {
       if (emitValue) {
            const jel: JournalEntryLine = this.journalEntryLine;
            const jelToSave = new JournalEntryLine();
            jelToSave.ID = jel.ID;
            jelToSave.Description = jel.Description;
            jelToSave.PaymentID = jel.PaymentID;
            jelToSave.CurrencyCodeID = jel.CurrencyCodeID;
            if (jel.JournalEntryTypeID < 0) {
                jelToSave.JournalEntryTypeID = null; // for å komme rundt problem med ID null i lookup, brukes -1 og setter null her
            } else {
                jelToSave.JournalEntryTypeID = jel.JournalEntryTypeID;
            }
            if (jel.Dimensions) {
                jelToSave.Dimensions = jel.Dimensions;
                jelToSave.Dimensions['_createguid'] = this.journalEntryLineService.getNewGuid();
            }
            this.journalEntryLineService.Put(jelToSave.ID, jelToSave).subscribe((res) => {
                this.onClose.emit(jel);
            });
        } else {
            this.onClose.emit(null);
        }
    }
​
    onDataChange(line?: JournalEntryLine) {
​
        const updatedEntity = line || this.journalEntryLine;
        this.journalEntryLine = updatedEntity;
    }
​
​
​
    private getFormFields(): UniFieldLayout[] {
        let fields =  [
            <any> {
                Property: 'Description',
                FieldType: FieldType.TEXT,
                Label: 'Beskrivelse',
            },
            <any> {
                Property: 'PaymentID',
                FieldType: FieldType.TEXT,
                Label: 'KID',
                Hidden: theme.theme === THEMES.EXT02
            },
            <any> {
                Property: 'JournalEntryTypeID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Bilagstype',
                Options: {
                    valueProperty: 'ID',
                    template: (je: JournalEntryType | JournalEntryLine) => {
                        if (je) {
                            if (je['JournalEntryTypeID']) {
                                return je['JournalEntryType']['DisplayName'];
                            } else if (je['DisplayName']) {
                                return je['DisplayName'];
                            }
                        }
                    },
                    source: this.jeTypes,
                    search: (query) => {
                        return this.jeTypes.filter(x => x.DisplayName.toLowerCase().startsWith(query.toLowerCase()));
                    }
                },
                FeaturePermission: 'ui.distribution'
            },
            <any> {
                Property: ''
            }
        ];
        return fields;

    }
​
​
​
    private setUpDims(dims) {
        this.dimensionTypes = [
            {
                Label: 'Prosjekt',
                Dimension: 1,
                IsActive: true,
                Property: 'Dimensions.ProjectID',
                Data: this.projects,
                FeaturePermission: 'ui.distribution'
            },
            {
                Label: 'Avdeling',
                Dimension: 2,
                IsActive: true,
                Property: 'Dimensions.DepartmentID',
                Data: this.departments,
                FeaturePermission: 'ui.distribution'
            }
        ];
​
        const queries = [];
​
        dims.forEach((dim) => {
            this.dimensionTypes.push({
                Label: dim.Label,
                Dimension: dim.Dimension,
                IsActive: dim.IsActive,
                Property: 'Dimensions.Dimension' + dim.Dimension + 'ID',
                Data: [],
                FeaturePermission: 'ui.distribution'
            });
            queries.push(this.customDimensionService.getCustomDimensionList(dim.Dimension));
        });
​
        Observable.forkJoin(queries).subscribe((res) => {
            res.forEach((list, index) => {
                this.dimensionTypes[index + 2].Data = res[index];
            });
            this.dimensionTypes = [].concat(this.dimensionTypes);
        });
    }
​
​
}

