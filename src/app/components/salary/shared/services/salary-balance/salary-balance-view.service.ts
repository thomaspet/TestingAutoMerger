import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {UniModalService, ConfirmActions, UniPreviewModal} from '@uni-framework/uni-modal';
import * as _ from 'lodash';
import {Observable} from 'rxjs';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { SalarybalanceService, ErrorService, ReportDefinitionService, FileService, FinancialYearService, WageTypeService } from '@app/services/services';
import { SalaryBalance, SalBalType, WageType } from '@uni-entities';
import { IToolbarSearchConfig } from '@app/components/common/toolbar/toolbar';

@Injectable()
export class SalaryBalanceViewService {

    private url: string = '/salary/salarybalances';

    constructor(
        private salaryBalanceService: SalarybalanceService,
        private wageTypeService: WageTypeService,
        private errorService: ErrorService,
        private router: Router,
        private reportDefinitionService: ReportDefinitionService,
        private modalService: UniModalService,
        private fileService: FileService,
        private toastService: ToastService,
        private financialYearService: FinancialYearService
    ) {}

    public setupSearchConfig(salaryBalance: SalaryBalance): IToolbarSearchConfig {
        return {
            lookupFunction: (query) => this.salaryBalanceService.GetAll(
                `filter=ID ne ${salaryBalance.ID} and (startswith(ID, '${query}') `
                + `or contains(Name, '${query}'))`
                + `&top=50&hateoas=false`
            ).catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            itemTemplate: (item: SalaryBalance) => `${item.ID} - `
                + `${item.Name}`,
            initValue: (!salaryBalance || !salaryBalance.ID)
                ? 'Nytt forskudd/trekk'
                : `${salaryBalance.ID} - ${salaryBalance.Name || 'Forskudd/Trekk'}`,
            onSelect: selected => this.router.navigate(['salary/salarybalances/' + selected.ID])
        };
    }

    public save(salarybalance: SalaryBalance) {
        const currentSalBal = _.cloneDeep(salarybalance);
        const errors = [];

        if (!salarybalance.InstalmentType) {
            errors.push('type');
        }

        if (!salarybalance.WageTypeNumber) {
            errors.push('lønnsart');
        }

        if (!salarybalance.EmployeeID) {
            errors.push('ansatt');
        }

        if (currentSalBal.InstalmentType === SalBalType.Union
            && !currentSalBal.SupplierID) {
            errors.push('leverandør');
        }

        if (errors.length > 0) {
            const lastError = errors.pop();
            const errorString = !!errors.length ? `${errors.join(', ')} og ${lastError}` : lastError;

            const message = `Legg til ${errorString} før du lagrer`;
            this.toastService.addToast(message, ToastType.bad, 5);
            return Observable.of(salarybalance);
        }

        return this.salaryBalanceService
            .save(salarybalance)
            .do(salaryBalance => {
                if (!salaryBalance.ID) {
                    return;
                }
                if (currentSalBal['_newFiles'] && currentSalBal['_newFiles'].length > 0) {
                    this.linkNewFiles(salaryBalance.ID, currentSalBal['_newFiles'], 'SalaryBalance');
                }

                if (!salaryBalance['CreatePayment'] && currentSalBal.InstalmentType === SalBalType.Advance && !currentSalBal.ID) {
                    this.showAdvanceReport(salaryBalance.ID);
                }
                if (salaryBalance.InstalmentType === SalBalType.Garnishment && this.financialYearService.getActiveYear() >= 2021) {
                    this.wageTypeService.getOrderByWageTypeNumber(`filter=WageTypeNumber eq ${salaryBalance.WageTypeNumber}`)
                    .subscribe((wageType: WageType) =>  {
                        if (wageType[0]?.IncomeType !== 'Utleggstrekk' || wageType[0].Description !== 'utleggstrekkSkatt') {
                            this.toastService.addToast('Sjekk oppsett', ToastType.warn, 15, 'Utleggstrekk skatt ikke satt opp korrekt på lønnsart for innrapportering på a-melding');
                        }
                    });
                }
            });
    }

    private linkNewFiles(ID: any, fileIDs: Array<any>, entityType: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fileIDs.forEach(fileID => {
                this.fileService.linkFile(entityType, ID, fileID).subscribe(x => resolve(x));
            });
        });
    }

    public delete(id: number) {
        this.modalService
            .confirm({
                header: 'Slett forskudd/trekk',
                message: `Er du sikker på at du vil slette forskudd/trekk ${id}?`,
                buttonLabels: {
                    accept: 'Ja',
                    reject: 'Nei'
                }
            })
            .onClose
            .switchMap((result: ConfirmActions) => result === ConfirmActions.ACCEPT
                ? this.salaryBalanceService.deleteSalaryBalance(id).map(() => result)
                : Observable.of(result))
            .subscribe((result) => {
                if (result !== ConfirmActions.ACCEPT) {
                    return;
                }
                this.router.navigateByUrl(this.url);
            });
    }

    public showAdvanceReport(id: number) {
        this.reportDefinitionService
            .getReportByName('Forskuddskvittering')
            .subscribe(report => {
                report.parameters = [{Name: 'SalaryBalanceID', value: id}];
                this.modalService.open(UniPreviewModal, {
                    data: report
                });
            });
    }
}
