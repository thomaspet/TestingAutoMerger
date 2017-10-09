import {LocalDate} from '../../unientities';

export enum KPI_STATUS {
    StatusUnknown = 0,
    StatusInProgress = 1,
    StatusError = 2,
    StatusReady = 3
}

export type KpiCompany = {
    FileFlowEmail: string;
    ID: number;
    Name: string;
    IsTest: boolean;
    Key: string;
    Kpi: {
        ID: number;
        KpiDefinitionID: number;
        Name: string;
        Application: string;
        CompanyID: number;
        Counter: number;
        ValueStatus: KPI_STATUS;
        LastUpdated: LocalDate;
    }[]
}
