import { Component, OnInit } from '@angular/core';
import { ISelectConfig } from '@uni-framework/ui/uniform';
import { UniModalService } from '@uni-framework/uni-modal';
import { JobService, ErrorService, ImportCentralService, UserService } from '@app/services/services';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ImportDetailsModal } from '../modals/import-details/import-details-modal';
import { ImportUIPermission, ImportSaftUIPermission } from '@app/models/import-central/ImportUIPermissionModel';
import { ImportJobName, TemplateType } from '@app/models/import-central/ImportDialogModel';

@Component({
    selector: 'import-central-log',
    templateUrl: './import-central-log.html',
    styleUrls: ['./import-central-log.sass']
})

export class ImportCentralLog implements OnInit {

    public config: ISelectConfig;
    public jobLogs: any[] = [];
    private templateType: TemplateType;
    public selectedType;
    public operators: any[] = [];
    public busy: boolean;
    uiPermission = {
        customer: new ImportUIPermission(),
        product: new ImportUIPermission(),
        supplier: new ImportUIPermission(),
        ledger: new ImportUIPermission(),
        payroll: new ImportUIPermission(),
        saft: new ImportSaftUIPermission(),
        voucher: new ImportUIPermission()
    }

    constructor(
        private modalService: UniModalService,
        private jobService: JobService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private userService: UserService,
        private importCentralService: ImportCentralService) { }

    ngOnInit() {
        this.getAccessibleComponents();
        //this.getJobsByName('');
        this.route.params.subscribe(params => {
            this.templateType = params['id'] ? +params['id'] : TemplateType.All;
            this.setupSelectedValue(this.templateType);
            this.getJobsByName();
        });
    }

    private getAccessibleComponents() {
        this.userService.getCurrentUser().subscribe(res => {
            const permissions = res['Permissions'];
            this.uiPermission = this.importCentralService.getAccessibleComponents(permissions);
            this.busy = false;
            this.setupDropdown();
        },
            err => {
                this.busy = false;
                this.errorService.handle('En feil oppstod, vennligst prøv igjen senere');
            }
        );
    }
    private setupDropdown() {
        this.config = {
            placeholder: 'Entity',
            searchable: false,
            displayProperty: 'name',
            hideDeleteButton: true
        };
        let templateType = [];
        templateType.push({ id: TemplateType.All, name: 'All' });
        if (this.uiPermission.product.hasComponentAccess) {
            templateType.push({ id: TemplateType.Product, name: 'Produkt' });
        }
        if (this.uiPermission.customer.hasComponentAccess) {
            templateType.push({ id: TemplateType.Customer, name: 'Kunde' });
        }
        if (this.uiPermission.supplier.hasComponentAccess) {
            templateType.push({ id: TemplateType.Supplier, name: 'Leverandør' });
        }
        if (this.uiPermission.ledger.hasComponentAccess) {
            templateType.push({ id: TemplateType.MainLedger, name: 'Kontoplan' });
        }
        if (this.uiPermission.payroll.hasComponentAccess) {
            templateType.push({ id: TemplateType.Payroll, name: 'Lønnsposter' });
        }
        if (this.uiPermission.saft.hasComponentAccess) {
            templateType.push({ id: TemplateType.Saft, name: 'Saft' });
        }
        if (this.uiPermission.voucher.hasComponentAccess) {
            templateType.push({ id: TemplateType.Voucher, name: 'Bilag' });
        }
        this.operators = [...templateType];
    }



    private setupSelectedValue(type: TemplateType) {
        switch (type) {
            case TemplateType.Customer:
                this.selectedType = { id: TemplateType.Customer, name: 'Kunde' }
                break;
            case TemplateType.Product:
                this.selectedType = { id: TemplateType.Product, name: 'Produkt' }
                break;
            case TemplateType.Supplier:
                this.selectedType = { id: TemplateType.Supplier, name: 'Leverandør' }
                break;
            case TemplateType.MainLedger:
                this.selectedType = { id: TemplateType.MainLedger, name: 'Kontoplan' }
                break;
            case TemplateType.Payroll:
                this.selectedType = { id: TemplateType.Payroll, name: 'Lønnsposter' }
                break;
            case TemplateType.Saft:
                this.selectedType = { id: TemplateType.Saft, name: 'Saft' }
                break;
            case TemplateType.Voucher:
                this.selectedType = { id: TemplateType.Voucher, name: 'Bilag' }
                break;
            default:
                this.selectedType = { id: TemplateType.All, name: 'All' }
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
                    entityName: this.getDataToImport(job.JobName, 'entityName'),
                    listName: this.getDataToImport(job.JobName, 'listName'),
                    url: this.getDataToImport(job.JobName, 'url'),
                }
            });
    }

    private getDataToImport(jobName, type): string {
        let str;
        switch (jobName) {
            case ImportJobName.Customer:
                switch (type) {
                    case 'entityName':
                        str = 'kunder';
                        break;
                    case 'listName':
                        str = 'kundelisten';
                        break;
                    case 'url':
                        str = '/sales/customer';
                        break;
                    default:
                        break;
                }
                break;
            case ImportJobName.Product:
                switch (type) {
                    case 'entityName':
                        str = 'produkter';
                        break;
                    case 'listName':
                        str = 'produktlisten';
                        break;
                    case 'url':
                        str = '/sales/products';
                        break;
                    default:
                        break;
                }
                break;
            case ImportJobName.Supplier:
                switch (type) {
                    case 'entityName':
                        str = 'leverandører';
                        break;
                    case 'listName':
                        str = 'leverandørlisten';
                        break;
                    case 'url':
                        str = '/accounting/suppliers';
                        break;
                    default:
                        break;
                }
                break;
            case ImportJobName.MainLedger:
                switch (type) {
                    case 'entityName':
                        str = 'Kontoplan';
                        break;
                    case 'listName':
                        str = 'Kontoplanlisten';
                        break;
                    case 'url':
                        str = '/accounting/accountsettings';
                        break;
                    default:
                        break;
                }
                break;
            case ImportJobName.Payroll:
                switch (type) {
                    case 'entityName':
                        str = 'Lønnsposter';
                        break;
                    case 'listName':
                        str = 'Lønnsposterlisten';
                        break;
                    case 'url':
                        str = '/salary/payrollrun';
                        break;
                    default:
                        break;
                }
                break;
            case ImportJobName.Saft:
                switch (type) {
                    case 'entityName':
                        str = 'Saft';
                        break;
                    case 'listName':
                        str = 'Saft-listen';
                        break;
                    case 'url':
                        str = '';
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        return str;
    }

    public onSelectChange(selectedItem) {
        this.templateType = selectedItem ? selectedItem.id : TemplateType.All;
        this.getJobsByName();
    }

    private getJobsByName() {
        this.busy = true;

        this.jobService.getLatestJobRuns(100).subscribe(
            results => {
                this.jobLogs = [];
                switch (this.templateType) {
                    case TemplateType.Product:
                        this.jobLogs.push(...results.filter(r => r.JobName === ImportJobName.Product));
                        break;
                    case TemplateType.Customer:
                        this.jobLogs.push(...results.filter(r => r.JobName === ImportJobName.Customer));
                        break;
                    case TemplateType.Supplier:
                        this.jobLogs.push(...results.filter(r => r.JobName === ImportJobName.Supplier));
                        break;
                    case TemplateType.MainLedger:
                        this.jobLogs.push(...results.filter(r => r.JobName === ImportJobName.MainLedger));
                        break;
                    case TemplateType.Payroll:
                        this.jobLogs.push(...results.filter(r => r.JobName === ImportJobName.Payroll));
                        break;
                    case TemplateType.Saft:
                        this.jobLogs.push(...results.filter(r => r.JobName === ImportJobName.Saft));
                    case TemplateType.Voucher:
                        this.jobLogs.push(...results.filter(r => r.JobName === ImportJobName.Voucher));
                        break;
                    case TemplateType.All:
                        this.jobLogs.push(
                            ...results.filter(
                                r => r.JobName === ImportJobName.Product ||
                                    r.JobName === ImportJobName.Customer ||
                                    r.JobName === ImportJobName.Supplier ||
                                    r.JobName === ImportJobName.MainLedger ||
                                    r.JobName === ImportJobName.Payroll ||
                                    r.JobName === ImportJobName.Saft || 
                                    r.JobName === ImportJobName.Voucher
                            ));
                        break;
                    default:
                        this.jobLogs.push(...results);
                        break;
                }
                if (this.jobLogs)
                    this.formatJobLogs();
                this.busy = false;
            },
            err => this.errorService.handle(err)
        );

        // commented because log.Progress array sometimes comes in incorrect format 
        //** to get the all jobs with job progress */
        // this.jobService.getJobRuns('').subscribe(
        //     results => {

        //     },
        //     err => this.errorService.handle('En feil oppstod, vennligst prøv igjen senere')
        // );
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