export type BureauTagsDictionary = {[key:string]: string[]}

export interface BureauPreferences {
    filterString: string
    sortIsDesc: boolean
    sortField: string
    tagsForCompany: BureauTagsDictionary
}
