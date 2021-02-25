export {ChangeMap} from './changeMap';
import * as moment from 'moment';

export enum ControlTypes {
    AutocompleteInput = 0,
    ButtonInput = 1,
    DateInput = 2,
    SelectInput = 3,
    MaskedInput = 4,
    CheckboxInput = 5,
    NumericInput = 6,
    RadioInput = 7,
    CheckboxgroupInput = 8,
    RadiogroupInput = 9,
    TextInput = 10,
    EmailInput = 11,
    PasswordInput = 12,
    HyperlinkInput = 13,
    MultivalueInput = 14,
    UrlInput = 15,
    TextareaInput = 16,
    LocalDate = 17,

    BANKACCOUNT = 23,
}

export enum FieldSize {
    Normal = 0,
    Double = 1,
    Quarter = 2,
    Full = 3
}

export function filterInput(v) {
    return v.replace(/[`~!@#$%^&*()_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
}

export function isObject (item) {
    return (typeof item === 'object' && !Array.isArray(item) && item !== null);
}

export function safeInt(value: any) {
    if (value === undefined) { return 0; }
    const tmp = parseInt(value, 10);
    if (isNaN(tmp)) {
        return 0;
    }
    return tmp;
}

export function roundTo(value: number, decimals = 2): number {
    let dVal = value;
    if (typeof(dVal) !== 'number') {
        dVal = safeDec(value);
    }
    return Number(Math.round(Number.parseFloat(dVal + 'e' + decimals)) + 'e-' + decimals);
}

export function safeDec(value: any) {
    if (value === undefined) { return 0; }
    if (typeof(value) === 'number') { return value; }
    if (typeof(value) === 'string') {
        const ixDot = value.indexOf('.');
        const ixComma = value.indexOf(',');
        const ixSpace = value.indexOf(' ');
        if (ixSpace >= 0) { value = value.replace(new RegExp('[ ]', 'g'), ''); }
        if (ixDot && ixComma && ixComma > ixDot) {
            value = value.replace(new RegExp('[.]', 'g'), '');
            value = value.replace(new RegExp('[,]', 'g'), '.');
        }
    }
    const tmp = parseFloat(value);
    if (isNaN(tmp)) {
        return 0;
    }
    return tmp;
}

export function createFormField(
    name: string, label: string, fieldType: any = ControlTypes.TextInput,
    size = FieldSize.Normal, hideLabel = false, fieldset = 0,
    legend?: string, options?: any): any {
    return {
        Property: name, Label: label,
        FieldType: fieldType,
        FieldSet: fieldset,
        Legend: legend,
        Combo: 0, Options: options,
        Classes: combineClasses(size, hideLabel)
    };
}

function combineClasses(size = FieldSize.Normal, hideLabel = false) {
    const classes = [];
    switch (size) {
        case FieldSize.Double:
            classes.push('half-width');
            break;
        case FieldSize.Quarter:
            classes.push('quarter-width');
            break;
        case FieldSize.Full:
            classes.push('max-width');
            break;
    }
    if (hideLabel) {
        classes.push('visuallyHideLabel');
    }
    return classes.length > 0 ? classes.join(' ') : undefined;
}

// <summary>
// example: setDeepValue(row, 'dimension.projectid', 123)
// </summary>
export function setDeepValue(item: any, name: string, value: any) {
    const parts = name.split('.');
    if (parts.length === 1) {
        item[name] = value.ID ? value.ID : value;
        return;
    }
    for (let i = 0; i < parts.length; i++) {
        const subName = parts[i];
        const sub = parts.join('.').substr(subName.length + 1);
        const subItem = item[subName] || {};
        if (!item[subName]) {
            item[subName] = subItem;
        }
        setDeepValue(subItem, sub, value);
    }
}

// <summary>
// example: getDeepValue(row, 'dimension.projectid')
// </summary>
export function getDeepValue(item: any, name: string) {
    const parts = name.split('.');
    if (parts.length === 1) {
        return item[name];
    }
    for (let i = 0; i < parts.length; i++) {
        const subName = parts[i];
        const sub = parts.join('.').substr(subName.length + 1);
        const subItem = item[subName] || {};
        if (!item[subName]) {
            item[subName] = subItem;
        }
        return getDeepValue(subItem, sub);
    }
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func: any, wait: number, immediate?: any) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        const later = () => {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

export function parseDate(value: any, allowMacros = true): Date {
    let d = 0;
    let m = 0;
    const y = 0;

    if (value === null) { return moment().toDate(); }

    if (typeof value === 'object') {
        if (value.getMonth) {
            return value;
        }
        if (value.toDate) {
            return value.toDate();
        }
    }


    if (allowMacros) {
        if (value === '*') { return moment().toDate(); }
    }

    if (value.indexOf('/') > 0) {
        const parts = value.split('/');
        if (parts.length === 3) {
            return moment(value, 'MM/DD/YY').toDate();
        }
    }

    if (value.indexOf('.') > 0) {
        switch (value.split('.').length) {
            case 3:
                return moment(value, 'DD.MM.YYYY').toDate();
            case 2:
                return moment(value, 'DD.MM').toDate();
        }
    }

    d = parseInt(value, 2);
    if (d > 0) {
        switch (value.length) {
            case 1:
            case 2:
                break;
            case 3: // 133 = 13.3, 205 = 20.5, 305 = 30.5
                d = safeInt(value.substr(0, 1));
                if (d > 3) {
                    m = safeInt(value.substr(1));
                } else {
                    d = safeInt(value.substr(0, 2));
                    m = safeInt(value.substr(2));
                }
                break;
            case 4:
                d = safeInt(value.substr(0, 2));
                m = safeInt(value.substr(2, 2));
                break;
        }

        return dateSerial(d, m, y);
    }


}

export function toIso(date: Date, includeTime = false, nullTime = false): string {
    const value: string = moment(date).format();
    if (includeTime) {
        if (nullTime) { return value.substr(0, 10) + 'T00:00:00'; }
        return value;
    }
    return value.substr(0, 10);
}

export function parseTime(value: string, allowMacros = true, date?: Date): Date {
    let h = 0;
    let m = 0;

    if (allowMacros) {
        if (value === '*') { return moment().toDate(); }
    }
    if (value.indexOf(':') > 0) {
        const parts = value.split(':');
        h = safeInt(parts[0]);
        m = safeInt(parts[1]);
    } else {
        switch (value.length) {
            case 1:
                h = safeInt(value);
                break;
            case 2:
                h = safeInt(value);
                if (h > 24) {
                    h = safeInt(value.substr(0, 1));
                    m = safeInt(value.substr(1)) * 10;
                }
                break;
            case 3:
                h = safeInt(value.substr(0, 1));
                if (h > 2) {
                    m = safeInt(value.substr(1));
                } else {
                    h = safeInt(value.substr(0, 2));
                    m = safeInt(value.substr(2));
                }
                break;
            case 4:
                h = safeInt(value.substr(0, 2));
                m = safeInt(value.substr(2, 2));
                break;
        }
    }

    return timeSerial(h, m, date);
}

export function addTime(value: Date, amount: number, addType: any = 'hours') {
    return moment(value).add('' + amount, addType).toDate();
}

function timeSerial(hour: number, minute: number, date?: Date): Date {
    return moment(date).hour(hour).minute(minute).second(0).toDate();
}

function dateSerial(day: number, month = 0, year = 0): Date {
    const d = new Date;
    const x = moment().date(day).month(month ? month - 1 : d.getMonth()).year( year || d.getFullYear() );
    const y = x.toDate();
    return y;
}

export function exportToFile(text: string, fileName: string) {
    const link: any = document.createElement('a');

    const blob = new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8;' });

    if (link.download !== undefined) {

        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style = 'visibility:hidden';
    }

    if (navigator.msSaveBlob) { // IE 10+
        link.addEventListener('click', function (event) {
            navigator.msSaveBlob(blob, fileName);
        }, false);
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function arrayToCsv(data: Array<any>, columnAsFormula: Array<string> = [],
                           columnDelimiter = ';', lineDelimiter = '\r\n', includeHeader = true) {
    let result, ctr, keys;

    if (data === null || !data.length) {
        return null;
    }

    keys = Object.keys(data[0]);

    result = '';
    if (includeHeader) {
        keys.forEach((key: string) => {
            result += (result.length > 0 ? columnDelimiter : '') + '"' + key + '"';
        });
        result += lineDelimiter;
    }

    data.forEach(function(item) {
        let prop: string;
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) { result += columnDelimiter; }
            prop = '' + item[key];
            if (prop) {
                if (prop.indexOf(columnDelimiter) > 0) {
                    prop = prop.replace(new RegExp(columnDelimiter, 'g'), '.');
                }
                if (columnAsFormula.indexOf(key) !== -1) { result += '='; }
                result += '"' + prop + '"';
            }
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}

export function trimLength(value: string, maxLength: number, addEllipsis: boolean = true): string {
    if (value && value.length > maxLength) {
        return value.substr(0, maxLength).trim() + (addEllipsis ? '..' : '');
    }
    return value;
}

export function capitalizeFirstLetter(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function capitalizeSentence(value: string, limitWords = 5) {
    if (!value) { return ''; }
    const words = value.split(' ');
    const output = [];
    for (let i = 0; i < words.length; i++) {
        output.push(capitalizeFirstLetter(words[i]));
        if (i >= limitWords - 1) {
            break;
        }
    }
    return output.join(' ');
}

export function addContextMenu(toolbarConfig: any, name: string, label: string,
                               action: (done) => void, disabled?: () => boolean ) {
    toolbarConfig.contextmenu = toolbarConfig.contextmenu || [];
    if (!toolbarConfig.contextmenu.find( x => x.name === name)) {
        toolbarConfig.contextmenu.push( {
            label: label,
            name: name,
            action: action,
            disabled: disabled
        });
    }
}

export function removeContextMenu(toolbarConfig: any, name: string) {
    const list = (<Array<any>>toolbarConfig.contextmenu);
    if (list && list.length > 0) {
        const index = list.findIndex( x => x.name === name);
        if (index >= 0) {
            list.splice(index, 1);
        }
    }
}


export function createRow(cells: number, emptyValue: any, ...values: any[]) {
    const row = [];
    values.forEach( item => {
        row.push(item);
    });
    for (let i = row.length; i < cells; i++) {
        if (typeof emptyValue === 'function') {
            row.push(emptyValue());
        } else {
            row.push(emptyValue);
        }
    }
    return row;
}

export function getNewGuid(): string {
    // tslint:disable-next-line
    return(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,function(){return(0|Math.random()*16).toString(16)});
}
