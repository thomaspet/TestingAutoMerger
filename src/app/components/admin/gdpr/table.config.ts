import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
const configStoreKey = `gdprPeopleList`;

// Name, email, phone, social security number
const nameColumn = new UniTableColumn(
    'Info.Name',
    'Navn',
    UniTableColumnType.Text);
const emailColumn = new UniTableColumn(
    'Info.DefaultEmail.EmailAddress',
    'Epost',
    UniTableColumnType.Text);
const phoneColumn = new UniTableColumn(
    'Info.DefaultPhone.Number',
    'Telefon',
    UniTableColumnType.Text);
const ssnColumn = new UniTableColumn(
    'SocialSecurityNumber',
    'ID-Nummer',
    UniTableColumnType.Text);
const sourceColumn = new UniTableColumn(
    '_Source',
    'Kilde',
    UniTableColumnType.Text);

export const tableConfig =  new UniTableConfig(configStoreKey, false, true, 10)
    .setSearchable(false)
    .setSortable(true)
    .setColumns([
        sourceColumn,
        ssnColumn,
        nameColumn,
        emailColumn,
        phoneColumn
    ]);
