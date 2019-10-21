export * from './table-autocomplete';
export * from './number';
export * from './select';
export * from './text';
export * from './typeahead';
export * from './dateTimePicker/dateTimePicker';
export * from './localDatePicker/LocalDatePicker';

import {UnitableAutocomplete} from './table-autocomplete';
import {UnitableNumberInput} from './number';
import {UnitableSelect} from './select';
import {UnitableTextInput} from './text';
import {UnitableTypeahead} from './typeahead';
import {UnitableDateTimepicker} from './dateTimePicker/dateTimePicker';
import {LocalDatePicker} from './localDatePicker/LocalDatePicker';

export const TABLE_CONTROLS = [
    UnitableAutocomplete,
    UnitableNumberInput,
    UnitableSelect,
    UnitableTextInput,
    UnitableTypeahead,
    UnitableDateTimepicker,
    LocalDatePicker
];
