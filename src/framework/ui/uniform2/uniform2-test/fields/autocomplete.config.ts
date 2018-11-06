import { Observable } from 'rxjs/observable';
const items = [
    {id: 1, name: 'iphone 6'},
    {id: 2, name: 'iphone 7'},
    {id: 3, name: 'iphone 8'},
    {id: 4, name: 'iphone X'},
    {id: 5, name: 'iphone SE'},
    {id: 6, name: 'Samsung 6'},
    {id: 7, name: 'Samsung 8'},
    {id: 8, name: 'Samsung 9'},
    {id: 9, name: 'Xiapmi MI6'},
    {id: 10, name: 'Xiaomi Redmi4'},
    {id: 11, name: 'Windows Mobile'},
];
export const autocompleteConfig = {
    Placeholder: 'write a value',
    Label: 'Phone Model',
    FieldType: 'autocomplete',
    Property: 'data.phone.model',
    UpdateOn: 'change',
    Tooltip: {
        Type: 'info',
        Text: 'This is am autocomplete field'
    },
    Options: {
        initialValueFn: (value) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(items.find(item => {
                        return value === item.id;
                    }));
                }, 1000);
            });
        },
        editor: (value) => {
            return new Promise(resolve => {
                const lastItem = items[items.length - 1];
                const newItem = {
                    id: lastItem.id + 1,
                    name: value
                };
                items.push(newItem);
                resolve(newItem);
            });
        },
        searchFn: (query: string) => {
            return Observable.create((observer) => {
                const filteredResults = items.filter((item) => {
                    return (item.name).toLowerCase().indexOf(query.toLowerCase()) >= 0;
                });
                setTimeout(() => {
                    observer.next(filteredResults);
                }, 200);
            });
        },
        valueProperty: 'id',
        labelProperty: 'name',
        searchOnButtonClick: false,
        source: [
            {id: 1, name: 'iphone 6'},
            {id: 2, name: 'iphone 7'},
            {id: 3, name: 'iphone 8'},
            {id: 4, name: 'iphone X'},
            {id: 5, name: 'iphone SE'},
            {id: 6, name: 'Samsung 6'},
            {id: 7, name: 'Samsung 8'},
            {id: 8, name: 'Samsung 9'},
            {id: 9, name: 'Xiapmi MI6'},
            {id: 10, name: 'Xiaomi Redmi4'},
            {id: 11, name: 'Windows Mobile'},
        ],
        itemTemplate: (item) => {
            if (!item || !item.id) {
                return item || '';
            }
            return `${item.id} - ${item.name}`;
        },
    }
};
