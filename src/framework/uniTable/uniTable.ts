export class UniTable {
	lookupUrl: string;
	searchable: boolean;
	editable: boolean;
	
	onSelect: (selectedRow?: any) => any;
	
	// TODO: Type these
	fields: any = {};
	columns: any[] = [];

	constructor(lookupUrl: string, searchable: boolean = true, editable: boolean = false) {
		this.lookupUrl = lookupUrl;
		this.searchable = searchable;
		this.editable = editable;
	}
	
	setSelect(onSelect: (selectedRow?: any) => any) {
		this.onSelect = onSelect;
	}
	
	addColumn(field: string, title: string, type: string, format?: string, editable?: boolean, filterable: boolean = true) {
		var colEditable = (editable === undefined) ? this.editable : editable;
		
		this.fields[field] = {
			type: type,
			editable: colEditable,
			filterable: filterable
		};
		
		if (format) {
			this.fields[field].format = format;
		}
		
		this.columns.push({
			field: field,
			title: title
		});
	}
	
	getConfig() {
		var config = {
			searchable: this.searchable,
			editable: this.editable,
			onSelect: this.onSelect,
			// gridButtons
			kOptions: {
				
				dataSource: {
					type: 'json',
					transport: {
						read: {
							url: this.lookupUrl,
							type: 'GET',
							headers: {
								'Client': 'client1'
							}
						}
					},
					schema: {
						model: {
							id: "ID",
							fields: this.fields
						}
					}
				},
				
				columns: this.columns,
				filterable: true,
			}	
		}
		return config;
	}
	
}