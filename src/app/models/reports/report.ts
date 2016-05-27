import {ReportDefinition, ReportDefinitionParameter} from '../../unientities';

export class ReportParameter extends ReportDefinitionParameter {
    public value: string;
}

export class Report extends ReportDefinition {
    public parameters: ReportParameter;
}
