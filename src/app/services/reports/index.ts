import {provide} from "@angular/core";
import {ReportDefinitionService} from "./ReportDefinitionService";
import {ReportDefinitionDataSourceService} from "./ReportDefinitionDataSourceService";
import {ReportDefinitionParameterService} from "./ReportDefinitionParameterService";

export const REPORT_PROVIDERS = [
    provide(ReportDefinitionService ,{useClass: ReportDefinitionService}),
    provide(ReportDefinitionDataSourceService ,{useClass: ReportDefinitionDataSourceService}),
    provide(ReportDefinitionParameterService ,{useClass: ReportDefinitionParameterService})
];
