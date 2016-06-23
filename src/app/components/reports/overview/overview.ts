import {Component, ViewChild} from '@angular/core';

import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {ReportDefinition} from '../../../unientities';
import {ReportDefinitionService} from '../../../services/services';

import {ParameterModal} from '../modals/parameter/parameterModal';
import {PreviewModal} from '../modals/preview/previewModal';
import {Report} from '../../../models/reports/report';

class ReportCategory {
    public name: string;
    public reports: Array<ReportDefinition>;
}

@Component({
    selector: 'uni-overview',
    templateUrl: 'app/components/reports/overview/overview.html',
    directives: [UniTabs, PreviewModal, ParameterModal],
    providers: [ReportDefinitionService]
})
export class Overview {
    @ViewChild(ParameterModal)
    private parameterModal: ParameterModal;
    @ViewChild(PreviewModal)
    private previewModal: PreviewModal;

    
    public reportCategories: Array<ReportCategory>;
    
    constructor(private tabService: TabService, private reportDefinitionService: ReportDefinitionService) {
        this.tabService.addTab({ name: 'Rapportoversikt', url: '/reports/overview', moduleID: 19, active: true });
    }
    
    
    public showModalReportParameters(report: ReportDefinition) {
        this.parameterModal.open(report, this.previewModal);
    }
    
    public ngOnInit() {
        this.reportDefinitionService.GetAll<ReportDefinition>(null).subscribe(reports => {
            this.reportCategories = new Array<ReportCategory>();
            
            for (const report of reports) {
                let reportCategory: ReportCategory = this.reportCategories.find(category => category.name === report.Category);
                
                if (typeof reportCategory === 'undefined') {
                    reportCategory = new ReportCategory();

                    reportCategory.name = report.Category;
                    reportCategory.reports = new Array<Report>();
                    
                    this.reportCategories.push(reportCategory);
                }
                reportCategory.reports.push(report);
            }
        });
    }
}