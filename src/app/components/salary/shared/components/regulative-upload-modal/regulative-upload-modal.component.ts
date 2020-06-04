import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { IUniModal, IModalOptions, ConfirmActions } from '@uni-framework/uni-modal';
import { BehaviorSubject, of, forkJoin, Observable } from 'rxjs';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';
import { RegulativeGroup, Regulative, LocalDate } from '@uni-entities';
import { UniFilesService, ErrorService } from '@app/services/services';
import { RegulativeService } from '@app/components/salary/regulative/shared/service/regulative.service';
import { switchMap, map, tap, finalize } from 'rxjs/operators';
import { RegulativeGroupService } from '@app/components/salary/regulative/shared/service/regulative-group.service';

export interface IRegulativeUploadResult {
    confirmAction: ConfirmActions;
    regulativeGroup: RegulativeGroup;
}

@Component({
    selector: 'uni-regulative-upload-modal',
    templateUrl: './regulative-upload-modal.component.html',
    styleUrls: ['./regulative-upload-modal.component.sass']
})
export class RegulativeUploadModalComponent implements OnInit, IUniModal {
    @Output() onClose: EventEmitter<IRegulativeUploadResult> = new EventEmitter();
    @Input() options: IModalOptions;
    forceCloseValueResolver?: () => any;

    groupConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    groupFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    groupModel$: BehaviorSubject<RegulativeGroup> = new BehaviorSubject(new RegulativeGroup());

    regulativeConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    regulativeFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    regulativeModel$: BehaviorSubject<Regulative> = new BehaviorSubject(new Regulative());
    importDisabled: boolean;

    busy: boolean;
    errorMessage: string;
    file: File;
    constructor(
        private fileService: UniFilesService,
        private errorService: ErrorService,
        private regulativeService: RegulativeService,
        private regulativeGroupService: RegulativeGroupService,
    ) { }

    ngOnInit() {

        this.groupConfig$.next({autofocus: !this.options.data.ID});
        this.groupFields$.next(this.getGroupFields(this.options.data));
        this.groupModel$.next(this.options.data);

        this.regulativeConfig$.next({autofocus: !!this.options.data.ID});
        this.regulativeFields$.next(this.getRegulativeFields());
        this.regulativeModel$.next({...new Regulative(), StartDate: new LocalDate()});

        this.forceCloseValueResolver = () => this.cancel();
    }

    private getGroupFields(group: RegulativeGroup): UniFieldLayout[] {
        return <UniFieldLayout[]>[
            {
                Property: 'Name',
                Label: 'Navn',
                FieldType: FieldType.TEXT,
                ReadOnly: !!group.ID,
            }
        ];
    }

    private getRegulativeFields(): UniFieldLayout[] {
        return <UniFieldLayout[]>[
            {
                Property: 'StartDate',
                Label: 'Startdato',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Validations: [
                    (value: LocalDate, field: UniFieldLayout) => {
                        const today = new LocalDate();
                        if (!value || value.month <= today.month || value.year < today.year) {
                            this.importDisabled = false;
                            return;
                        }
                        this.importDisabled = true;

                        return {
                            field: field,
                            value: value,
                            errorMessage: 'Startdato kan bare vere i måneden man står i eller tidligere',
                            isWarning: false
                        };
                        }
                ]
            }
        ];
    }

    close() {
        this.onClose.next(this.cancel());
    }

    private cancel() {
        return {confirmAction: ConfirmActions.CANCEL, regulativeGroup: this.options.data};
    }

    import() {
        if (!this.file || this.errorMessage) {
            this.errorService.handle(this.errorMessage || 'Ingen fil valgt');
            return;
        }
        this.busy = true;
        this.groupModel$
            .take(1)
            .pipe(
                switchMap(group =>
                    forkJoin(
                        this.getRegulativeWithGroupID(group, this.regulativeModel$.getValue()),
                        this.fileService.upload(this.file).pipe(map(file => <number>file.ExternalId)),
                    )
                ),
                switchMap((ret: [Regulative, number]) => this.regulativeService.import(ret[0], ret[1])),
                map(regulative => {
                    const group = this.groupModel$.getValue();
                    if (!group.Regulatives || !group.Regulatives.length) {
                        group.Regulatives = [regulative];
                    } else {
                        group.Regulatives = [
                            ...group.Regulatives.filter(reg => reg.StartDate === regulative.StartDate
                                ? reg.CreatedAt > regulative.CreatedAt
                                : reg.StartDate > regulative.StartDate),
                            regulative,
                            ...group.Regulatives.filter(reg => reg.StartDate === regulative.StartDate
                                ? reg.CreatedAt < regulative.CreatedAt
                                : reg.StartDate < regulative.StartDate)
                        ];
                    }

                    return group;
                }),
                finalize(() => this.busy = false)
            )
            .subscribe(group => this.onClose.next({
                confirmAction: ConfirmActions.ACCEPT,
                regulativeGroup: group,
            }));
    }

    uploadFileChange(event) {
        const source = event.srcElement || event.target;
        if (source.files && source.files.length) {
            const type = source.files[0].name.split(/[.]+/).pop();
            if (type === 'xlsx') {
                this.errorMessage = null;
                this.file = source.files[0];
            } else {
                this.errorMessage = 'Valgt fil har et filformat som ikke er støttet';
                this.errorService.handle(this.errorMessage);
            }
        }
    }

    private getRegulativeWithGroupID(regulativeGroup: RegulativeGroup, regulative: Regulative): Observable<Regulative> {
        return (
                regulativeGroup.ID
                    ? of(regulativeGroup)
                    : this.regulativeGroupService.Post(regulativeGroup)
            )
            .pipe(
                tap(group => this.groupModel$.next(group)),
                map(group => ({...regulative, RegulativeGroupID: group.ID}))
            );
    }

}
