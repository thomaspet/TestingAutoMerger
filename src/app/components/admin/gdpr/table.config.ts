import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import {saveAs} from 'file-saver';
import { GdprFileWriter } from '@app/components/admin/gdpr/gdpr-file-writer';
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
const downloadColumn = new UniTableColumn(
    'ID',
    '',
    UniTableColumnType.Link);

downloadColumn
    .setLinkClick((rowModel => {
        const content = new GdprFileWriter().createFileContent(rowModel);
        const filename = rowModel.Info.Name + '.txt';
        const blob = new Blob([content], {
            type: 'text/plain;charset=utf-8'
        });
        saveAs(blob, filename);
    }))
    .setTemplate(() => 'Download');

export const tableConfig =  new UniTableConfig(configStoreKey, false, false)
    .setSearchable(false)
    .setSortable(true)
    .setColumns([
        sourceColumn,
        ssnColumn,
        nameColumn,
        emailColumn,
        phoneColumn,
        downloadColumn
    ]);
