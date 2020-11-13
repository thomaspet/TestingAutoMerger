import { FieldType, UniFieldLayout } from '@uni-framework/ui/uniform';

export const resultBalanceFilter = (projects, departments) => {
    // Dimension filters
    const project = <any>new UniFieldLayout();
    project.Property = 'ProjectNumber';
    project.FieldType = FieldType.DROPDOWN;
    project.Label = 'Prosjekt';
    project.FeaturePermission = 'ui.dimensions';
    project.Legend = 'Filter';
    project.FieldSet = 1;
    project.Placeholder = 'Prosjekt';
    project.Options = {
        source: projects,
        valueProperty: 'ProjectNumber',
        template: (item) => {
            return item !== null ? (item.ProjectNumber + ': ' + item.Name) : '';
        },
        debounceTime: 200
    };

    const department = <any>new UniFieldLayout();
    department.Property = 'DepartmentNumber';
    department.FieldType = FieldType.DROPDOWN;
    department.Label = 'Avdeling';
    department.FeaturePermission = 'ui.dimensions';
    department.Legend = 'Filter';
    department.FieldSet = 1;
    department.Options = {
        source: departments,
        valueProperty: 'DepartmentNumber',
        template: (item) => {
            return item !== null ? (item.DepartmentNumber + ': ' + item.Name) : '';
        },
        debounceTime: 200
    };

    // Numbers
    const decimals = new UniFieldLayout();
    decimals.Property = 'Decimals';
    decimals.FieldType = FieldType.DROPDOWN;
    decimals.Label = 'Antall desimaler';
    decimals.Legend = 'Visning';
    decimals.FieldSet = 1;
    decimals.Options = {
        source: [{Decimals: 0}, {Decimals: 2}],
        valueProperty: 'Decimals',
        template: (item) => {
            return item.Decimals.toString();
        },
        debounceTime: 200
    };

    const showprevyear = new UniFieldLayout();
    showprevyear.Property = 'ShowPreviousAccountYear';
    showprevyear.FieldType = FieldType.CHECKBOX;
    showprevyear.Label = 'Vis foregående år';
    showprevyear.Legend = 'Visning';
    showprevyear.FieldSet = 2;

    const showpercent = new UniFieldLayout();
    showpercent.Property = 'ShowPercent';
    showpercent.FieldType = FieldType.CHECKBOX;
    showpercent.Label = 'Vis % av fjoråret';
    showpercent.FieldSet = 2;

    const showpercentofbudget = new UniFieldLayout();
    showpercentofbudget.Property = 'ShowPercentOfBudget';
    showpercentofbudget.FieldType = FieldType.CHECKBOX;
    showpercentofbudget.Label = 'Vis % av budsjett';
    showpercentofbudget.FieldSet = 2;

    const showBudget = <any>new UniFieldLayout();
    showBudget.Property = 'ShowBudget';
    showBudget.FieldType = FieldType.CHECKBOX;
    showBudget.Label = 'Vis budsjett';
    showBudget.FieldSet = 2;

    return [project, department, showBudget, decimals, showprevyear, showpercent, showpercentofbudget];
};
