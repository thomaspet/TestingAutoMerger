export enum ProjectResponsibilityEnum {
    Responsible = 0,
    ExecutiveOfficer = 1,
    LabourLeader = 2,
    Member = 3,
    External = 4
}

export var ProjectResponsibility = [
    { ID: ProjectResponsibilityEnum.Responsible, Title: 'Ansvarlig' },
    { ID: ProjectResponsibilityEnum.ExecutiveOfficer, Title: 'Saksbehandler' },
    { ID: ProjectResponsibilityEnum.LabourLeader, Title: 'Arbeidsleder' },
    { ID: ProjectResponsibilityEnum.Member, Title: 'Medlem' },
    { ID: ProjectResponsibilityEnum.External, Title: 'Ekstern' }
];
