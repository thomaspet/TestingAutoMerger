import { Component, OnInit } from '@angular/core';
import { ISelectConfig } from '@uni-framework/ui/uniform';
import { UniModules, TabService } from '@app/components/layout/navbar/tabstrip/tabService';
import { UniModalService } from '@uni-framework/uni-modal';
import { ImportDetailsModal } from '../modals/import-details/import-details-modal';
import { TemplateType } from '../import-central.component';
import { JobService, ErrorService } from '@app/services/services';
import { JobRun } from '@app/models/admin/jobs/jobRun';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

@Component({
    selector: 'import-central-log-history',
    templateUrl: './import-central-log-history.html',
    styleUrls: ['./import-central-log-history.sass']
})

export class ImportCentralLogHistoryComponent implements OnInit {

    public config: ISelectConfig;
    public jobLogs: any[] = [];
    private templateType: TemplateType;
    public selectedType;
    public operators: any[] = [];

    constructor(
        private tabService: TabService,
        private modalService: UniModalService,
        private jobService: JobService,
        private errorService: ErrorService,
        private route: ActivatedRoute) { }

    ngOnInit() {
        this.setupDropdown();
        //this.getJobsByName('');
        this.route.params.subscribe(params => {
            this.templateType = +params['id'];
            this.setupSelectedValue(this.templateType);
            this.setupTabName();
            this.getJobsByName();
        });

    }

    private setupDropdown() {
        this.config = {
            placeholder: 'Entity',
            searchable: false,
            displayProperty: 'name',
        };

        this.operators = [
            { id: TemplateType.all, name: 'All' },
            { id: TemplateType.product, name: 'Produkt' },
            { id: TemplateType.customer, name: 'Kunde' },
            { id: TemplateType.supplier, name: 'Leverandør' }];
    }

    private setupTabName() {
        this.tabService.addTab({
            url: `/admin/import-central-log-history/${this.templateType}`,
            name: 'Importsentral Logg',
            active: true,
            moduleID: UniModules.ImportCentralLog
        });
    }

    private setupSelectedValue(type: TemplateType) {
        switch (type) {
            case TemplateType.customer:
                this.selectedType = { id: TemplateType.customer, name: 'Kunde' }
                break;
            case TemplateType.product:
                this.selectedType = { id: TemplateType.product, name: 'Produkt' }
                break;
            case TemplateType.supplier:
                this.selectedType = { id: TemplateType.supplier, name: 'Leverandør' }
                break;
            default:
                this.selectedType = { id: TemplateType.saft, name: 'All' }
                break;
        }
    }

    public onImportDetails(job) {
        let header = 'Importdetaljer'
        this.modalService.open(ImportDetailsModal,
            {
                header: header,
                data: {
                    jobName: job.JobName,
                    hangfireJobId: job.HangfireJobId,
                    entityName: job.JobName.toUpperCase().includes('CUSTOMER') ? 'kunder' : job.JobName.toUpperCase().includes('PRODUCT') ? 'produkter' : 'leverandører',
                    listName: job.JobName.toUpperCase().includes('CUSTOMER') ? 'kundelisten' : job.JobName.toUpperCase().includes('PRODUCT') ? 'produktlisten' : 'leverandørlisten',
                    url: job.JobName.toUpperCase().includes('CUSTOMER') ? '/sales/customer' : job.JobName.toUpperCase().includes('PRODUCT') ?'/sales/products': '/accounting/suppliers'
                }
            });
    }

    public onSelectChange(selectedItem) {
        this.templateType = selectedItem ? selectedItem.id : TemplateType.all;
        this.getJobsByName();
        this.setupTabName();
    }

    private getJobsByName() {
        //** to get the all jobs with job progress */
        this.jobService.getJobRuns('').subscribe(
            results => {
                this.jobLogs = [];
                switch (this.templateType) {
                    case TemplateType.product:
                        this.jobLogs.push(...results.filter(r => r.JobName === 'ProductImportJob'));
                        break;
                    case TemplateType.customer:
                        this.jobLogs.push(...results.filter(r => r.JobName === 'CustomerImportJob'));
                        break;
                    case TemplateType.supplier:
                        this.jobLogs.push(...results.filter(r => r.JobName === 'SupplierImportJob'));
                        break;
                    case TemplateType.all:
                        this.jobLogs.push(...results.filter(r => r.JobName === 'ProductImportJob' || r.JobName === 'CustomerImportJob' || r.JobName === 'SupplierImportJob'));
                        break;
                    default:
                        this.jobLogs.push(...results);
                        break;
                }
                if (this.jobLogs)
                    this.formatJobLogs();
            },
            err => this.errorService.handle('En feil oppstod, vennligst prøv igjen senere')
        );
    }

    private formatJobLogs() {
        this.jobLogs.map(log => {
            log.Created = moment(log.Created).format('DD.MM.YY - HH:mm');
            if (log.Progress && log.Progress.length) {
                log.Ended = moment(log.Progress[0].Created).format('HH:mm');
                log.Status = log.Progress[0].Progress;
            }
            else { log.Ended = log.Status = '-'; }

        });
    }
}