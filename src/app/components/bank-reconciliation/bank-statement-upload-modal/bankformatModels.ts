
export enum FieldMapEnum {
    Skip = 0,
    Date = 1,
    Text = 2,
    Amount = 3,
    Debit = 4,
    Credit = 5,
    ArchiveCode = 6,
    Presign = 7,
    Text2 = 8,
    SecondaryAccount = 9,
    Category = 10
}

export enum FieldTypeEnum {
    Text = 1,
    Decimal = 2,  // Normal decimal with . or ,
    Decimal_00 = 3, // 1000 = 10.00
    NorDate = 4, // 31.12.2019
    IsoDate = 5, // 2019-12-31
    IsoDate2 = 6 // 20191231
}

export class ImportTemplate {
    Name: string;
    IsFixed = false;
    Separator = ';';
    SkipRows = 0;
    Columns: Array<ImportColumn> = [];

    public static getFieldNameFromEnum(map: FieldMapEnum) {
        switch (map) {
            case FieldMapEnum.Skip: return 'Velg kolonne';
            case FieldMapEnum.Date: return 'Dato';
            case FieldMapEnum.Text: return 'Tekst';
            case FieldMapEnum.Text2: return 'Sekundærtekst';
            case FieldMapEnum.Amount: return 'Beløp';
            case FieldMapEnum.Debit: return 'InnPåKonto';
            case FieldMapEnum.Credit: return 'UtAvKonto';
            case FieldMapEnum.ArchiveCode: return 'Arkivkode';
            case FieldMapEnum.Presign: return 'Fortegn';
            case FieldMapEnum.SecondaryAccount: return 'Sekundærkonto';
            case FieldMapEnum.Category: return 'Kategori';
        }
    }

    public static getFieldNames(): string[] {
        const list = [];
        for (let i = 0; i <= 10; i++) {
            list.push(ImportTemplate.getFieldNameFromEnum(i));
        }
        return list;
    }

    public static getFieldTypeNames(): string[] {
        return ['Tekst', 'Desimal', 'Desimal/100', 'dd.mm.yyyy', 'yyyy-mm-dd', 'yyyymmdd'];
    }

    addColumn(map: FieldMapEnum, startPos?: number, dataType = FieldTypeEnum.Text, length = 0) {
        const col = <ImportColumn>{ FieldMapping: map, StartPos: startPos || this.Columns.length + 1, Length: length, DataType: dataType,
            FieldName: ImportTemplate.getFieldNameFromEnum(map) };
        const types = ImportTemplate.getFieldTypeNames();
        col.FieldTypeName = col.DataType > 0 ? types[col.DataType - 1] : '';
        this.Columns.push(col);
    }
}

export class ImportColumn {
    FieldMapping: FieldMapEnum;
    FieldName?: string;
    DataType: FieldTypeEnum;
    FieldTypeName?: string;
    StartPos: number;
    Length?: number;
}
