import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { PredefinedDescription } from '@app/unientities';
import { of } from 'rxjs';

export const descriptionColumn = (predefinedDescriptions: PredefinedDescription[]) => {
    return new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Typeahead)
        .setOptions({
            lookupFunction: (query) => {
                const results = (predefinedDescriptions || []).filter(item => {
                    const code = (item.Code || '').toString();
                    const description = (item.Description || '').toLowerCase();
                    query = query.toLowerCase();

                    return code.startsWith(query) || description.includes(query);
                });

                return of(results);
            },
            itemTemplate: (item) => {
                return (item.Code + ': ' + item.Description);
            },
            itemValue: (item) => {
                return item ? item.Description : '';
            }
        });
};
