import {Component, OnInit, Output, EventEmitter, ViewChild, SimpleChanges} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {A06Options, AltinnReceipt, Maaned, ReportType} from '@uni-entities';
import {AltinnIntegrationService, ErrorService, FinancialYearService} from '@app/services/services';
import {AltinnErrorHandlerService} from '@app/components/salary/amelding/shared/service/altinnErrorHandlerService';
import {UniFieldLayout, FieldType, UniForm, UniField} from '@uni-framework/ui/uniform';

@Component({
  selector: 'uni-reconciliation-request',
  templateUrl: './reconciliation-request.component.html',
  styleUrls: ['./reconciliation-request.component.sass']
})
export class ReconciliationRequestComponent implements OnInit {

    public busy: boolean;
    public model$: BehaviorSubject<A06Options> = new BehaviorSubject(this.getStandardOption());
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autoFocus: true});
    public error: string;
    @Output() public newReconciliation: EventEmitter<AltinnReceipt> = new EventEmitter();
    @ViewChild(UniForm, { static: true }) public form: UniForm;
    constructor(
        private altinnIntegrationService: AltinnIntegrationService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        private altinnErrorService: AltinnErrorHandlerService
    ) { }

    public ngOnInit() {
        const year = this.financialYearService.getActiveYear();

        const model = this.model$.getValue();
        model.Year = year;
        this.model$.next(model);
        this.fields$.next(this.getFields(year));
    }

    private getStandardOption(): A06Options {
        const ret = new A06Options();
        ret.FromPeriod = Maaned.Item01;
        ret.ToPeriod = Maaned.Item12;
        ret.ReportType = ReportType.regnearkOdsV2;
        return ret;
    }

    private getFields(year: number): any[] {
        return [
            <UniFieldLayout>{
                Property: 'FromPeriod',
                Label: 'Fra periode',
                FieldType: FieldType.DROPDOWN,
                Options: {
                    source: this.getPeriodTypes(year),
                    valueProperty: 'value',
                    displayProperty: 'name'
                }
            },
            <UniFieldLayout>{
                Property: 'ToPeriod',
                Label: 'Til periode',
                FieldType: FieldType.DROPDOWN,
                Options: {
                    source: this.getPeriodTypes(year),
                    valueProperty: 'value',
                    displayProperty: 'name'
                }
            },
            <UniFieldLayout>{
                Property: 'IncludeEmployments',
                Label: 'Arbeidsforhold',
                FieldType: FieldType.CHECKBOX,
                ReadOnly: true
            },
            <UniFieldLayout>{
                Property: 'IncludeIncome',
                Label: 'Inntektsinformasjon',
                FieldType: FieldType.CHECKBOX
            },
            <UniFieldLayout>{
                Property: 'IncludeInfoPerPerson',
                Label: 'Opplysninger per ansatt',
                FieldType: FieldType.CHECKBOX
            },
        ];
    }

    private getPeriodTypes(year: number): {name: string, value: Maaned}[] {
        return [
            {name: `${Maaned.Item01 + 1} - ${year}`, value: Maaned.Item01},
            {name: `${Maaned.Item02 + 1} - ${year}`, value: Maaned.Item02},
            {name: `${Maaned.Item03 + 1} - ${year}`, value: Maaned.Item03},
            {name: `${Maaned.Item04 + 1} - ${year}`, value: Maaned.Item04},
            {name: `${Maaned.Item05 + 1} - ${year}`, value: Maaned.Item05},
            {name: `${Maaned.Item06 + 1} - ${year}`, value: Maaned.Item06},
            {name: `${Maaned.Item07 + 1} - ${year}`, value: Maaned.Item07},
            {name: `${Maaned.Item08 + 1} - ${year}`, value: Maaned.Item08},
            {name: `${Maaned.Item09 + 1} - ${year}`, value: Maaned.Item09},
            {name: `${Maaned.Item10 + 1} - ${year}`, value: Maaned.Item10},
            {name: `${Maaned.Item11 + 1} - ${year}`, value: Maaned.Item11},
            {name: `${Maaned.Item12 + 1} - ${year}`, value: Maaned.Item12},
        ];
    }

    public onReconciliationRequest() {
        this.busy = true;
        this.model$
            .take(1)
            .switchMap(model => this.altinnIntegrationService.sendReconciliationRequest(model))
            .do(receipt => this.handleReceiptResponse(receipt))
            .do((receipt) => this.newReconciliation.next(receipt))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .finally(() => this.busy = false)
            .do(() => this.setReadOnly('IncludeEmployments', true))
            .subscribe(receipt => this.model$.next(this.getStandardOption()));
    }

    private handleReceiptResponse(receipt: AltinnReceipt) {
        this.error = this.altinnErrorService.generateError(receipt);
    }

    public onFormChange(changes: SimpleChanges) {
        if (!changes['FromPeriod'] && !changes['ToPeriod']) {
            return;
        }
        this.model$
            .take(1)
            .map(model => {
                model.IncludeEmployments = model.IncludeEmployments && model.FromPeriod === model.ToPeriod;
                return model;
            })
            .do(model => this.model$.next(model))
            .map(model => model.FromPeriod !== model.ToPeriod)
            .subscribe(isReadOnly => this.setReadOnly('IncludeEmployments', isReadOnly));
    }

    private setReadOnly(prop: string, readOnly: boolean) {
        const fields = this.fields$.getValue();
        const field = fields.find(fld => fld.Property === prop);
        field.ReadOnly = readOnly;
        this.fields$.next(fields);
    }
}
