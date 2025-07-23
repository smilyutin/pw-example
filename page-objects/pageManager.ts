import { Page, expect } from '@playwright/test'
import { NavigationPage } from "../page-objects/navigationPage"
import { FormLayoutPage } from '../page-objects/formLayoutsPage'
import { DatePickerPage } from '../page-objects/datepickerPage'

export class PageManager {
    private readonly page: Page
    private readonly navigationPage: NavigationPage
    private readonly formLayoutsPage: FormLayoutPage
    private readonly datepickerPage: DatePickerPage

    constructor( page: Page) {
        this.page = page
        this.navigationPage = new NavigationPage(this.page)
        this.formLayoutsPage = new FormLayoutPage(this.page)
        this.datepickerPage = new DatePickerPage(this.page)
    }

    navigateTo(){
        return this.navigationPage
    }

    onFormLayoutsPage(){
        return this.formLayoutsPage
    }

    onDatepickerPage(){
        return this.datepickerPage
    }


}