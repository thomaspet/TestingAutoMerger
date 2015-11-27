export class UniGridConfig {
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
	
	addColumn(field: string, title: string, type: string, editable?: boolean, nullable: boolean = true) {
		var colEditable = (editable === undefined) ? this.editable : editable;
		
		this.fields[field] = {
			type: type,
			editable: colEditable,
			nullable: nullable
		};
		
		this.columns.push({
			field: field,
			title: title
		});
	}
	
	getConfig() {
		console.log(this.fields);
		console.log(this.columns);
		return {
			searchable: this.searchable,
			editable: this.editable,
			onSelect: this.onSelect,
			// gridButtons
			kOptions: {
				
				dataSource: new kendo.data.DataSource({
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
							id: "ID",//'grid-model-' + Date.now(), // unique model ID (kendo requires this)
							fields: this.fields
						}
					}
				}),
				
				columns: this.columns,
			}	
		}
	}
	
}