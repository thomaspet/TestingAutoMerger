import {TypeOfEmployment, RemunerationType, WorkingHoursScheme, ShipTypeOfShip, ShipRegistry, ShipTradeArea} from '../unientities';

export class EmploymentStatuses {
    private static typeOfEmployment: { ID: number, Name: string }[] = [
        { ID: 0, Name: 'Ikke valgt' },
        { ID: TypeOfEmployment.OrdinaryEmployment, Name: '1 - Ordinært arbeidsforhold' },
        { ID: TypeOfEmployment.MaritimeEmployment, Name: '2 - Maritimt arbeidsforhold' },
        { ID: TypeOfEmployment.FrilancerContratorFeeRecipient, Name: '3 - Frilanser, oppdragstager, honorar' },
        { ID: TypeOfEmployment.PensionOrOtherNonEmployedBenefits, Name: '4 - Pensjon og annet uten ansettelse' }
    ];

    private static remunerationType: { ID: number, Name: string }[] = [
        { ID: 0, Name: 'Ikke valgt' },
        { ID: RemunerationType.FixedSalary , Name: '1 - Fast lønnet' },
        { ID: RemunerationType.HourlyPaid, Name: '2 - Timelønnet' },
        { ID: RemunerationType.PaidOnCommission, Name: '3 - Provisjonslønnet' },
        { ID: RemunerationType.OnAgreement_Honorar, Name: '4 - Honorar' },
        { ID: RemunerationType.ByPerformance, Name: '5 - Akkord' }
    ];

    private static workingHoursScheme: { ID: number, Name: string }[] = [
        { ID: 0, Name: 'Ikke valgt' },
        { ID: WorkingHoursScheme.NonShift, Name: '1 - Ikke skiftarbeid' },
        { ID: WorkingHoursScheme.OffshoreWork, Name: '2 - Arbeid offshore' },
        { ID: WorkingHoursScheme.ContinousShiftwork336, Name: '3 - Helkontinuerlig skiftarbeid' },
        { ID: WorkingHoursScheme.DayAndNightContinous355, Name: '4 - Døgnkontinuerlig skiftarbeid' },
        { ID: WorkingHoursScheme.ShiftWork, Name: '5 - skiftarbeid' }
    ];

    private static shipType: {ID: number, Name: string}[] = [
        {ID: ShipTypeOfShip.notSet, Name: 'Ikke valgt'},
        {ID: ShipTypeOfShip.Other, Name: '1 - Annet'},
        {ID: ShipTypeOfShip.DrillingPlatform, Name: '2 - Boreplattform'},
        {ID: ShipTypeOfShip.Tourist, Name: '3 - Turist'}
    ];

    private static shipReg: {ID: number, Name: string}[] = [
        {ID: ShipRegistry.notSet, Name: 'Ikke valgt'},
        {ID: ShipRegistry.NorwegianInternationalShipRegister, Name: '1 - Norsk Internasjonalt skipsregister (NIS)'},
        {ID: ShipRegistry.NorwegianOrdinaryShipRegister, Name: '2 - Norsk ordinært skipsregister (NOR)'},
        {ID: ShipRegistry.ForeignShipRegister, Name: '3 - Utenlandsk skipsregister (UTL)'}
    ];

    private static tradeArea: {ID: number, Name: string}[] = [
        {ID: ShipTradeArea.notSet, Name: 'Ikke valgt'},
        {ID: ShipTradeArea.Domestic, Name: '1 - Innenriks'},
        {ID: ShipTradeArea.Foreign, Name: '2 - Utenriks'}
    ];



    public static employmentTypeToText(type: number) {
        return this.typeToText(this.typeOfEmployment.find(x => x.ID === type));
    }

    public static remunerationTypeToText(type: number) {
        return this.typeToText(this.remunerationType.find(x => x.ID === type));
    }

    public static workingHoursSchemeToText(type: number) {
        return this.typeToText(this.workingHoursScheme.find(x => x.ID === type));
    }

    public static shipTypeToText(type: ShipTypeOfShip) {
        return this.typeToText(this.shipType.find(t => t.ID === type));
    }

    public static shipRegToText(type: ShipRegistry) {
        return this.typeToText(this.shipReg.find(t => t.ID === type));
    }

    public static tradeAreaToText(type: ShipTradeArea) {
        return this.typeToText(this.tradeArea.find(t => t.ID === type));
    }

    private static typeToText(obj: {ID: number, Name: string}) {
        return obj && obj.Name;
    }
}
