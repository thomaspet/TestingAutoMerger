import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {SalarybalanceService, ErrorService, ReportDefinitionService, FileService} from '../../../../services/services';
import {SalaryBalance, SalBalType} from '../../../../unientities';
import {IToolbarSearchConfig} from '../../../common/toolbar/toolbarSearch';
import {UniModalService} from '@uni-framework/uniModal/barrel';
import {UniPreviewModal} from '@app/components/reports/modals/preview/previewModal';
import * as _ from 'lodash';

@Injectable()
export class SalaryBalanceViewService {

    constructor(
        private salaryBalanceService: SalarybalanceService,
        private errorService: ErrorService,
        private router: Router,
        private reportDefinitionService: ReportDefinitionService,
        private modalService: UniModalService,
        private fileService: FileService
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
            onSelect: selected => this.router.navigate(['salary/wagetypes/' + selected.ID])
        };
    }

    public save(salarybalance: SalaryBalance) {
        const currentSalBal = _.cloneDeep(salarybalance);
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
            });
    }

    private linkNewFiles(ID: any, fileIDs: Array<any>, entityType: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fileIDs.forEach(fileID => {
                this.fileService.linkFile(entityType, ID, fileID).subscribe(x => resolve(x));
            });
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
