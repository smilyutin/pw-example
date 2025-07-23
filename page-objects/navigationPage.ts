import { Page } from '@playwright/test'
export class NavigationPage {
    readonly page: Page

    constructor(page: Page){
        this.page = page
    }
 
    async formLayoutsPage(){
        await this.selectGroupMenuItem('Forms')
        await this.page.waitForTimeout(2000)
        await this.page.getByText(`Form Layouts`).click()
        await this.selectGroupMenuItem('Forms')
    }
    async datepickerPage(){
        await this.selectGroupMenuItem('Forms')
        await this.page.waitForTimeout(2000)
        await this.page.getByText(`Datepicker`).click()
    }
    async smartTablePage(){
        await this.selectGroupMenuItem(`Tables & Data`)
        await this.page.getByText(`Smart Table`).click()
    }
    async toastrPage (){
        await this.selectGroupMenuItem(`Modal & Overlays`)
        await this.page.getByText(`Toastr`).click()
        await this.page.getByText(`Modal & Overlays`).click()
    }
    async tooltipPage (){
        await this.selectGroupMenuItem(`Modal & Overlays`)
        // await this.page.waitForTimeout(2000)
        await this.page.getByText(`Tooltip`).click()
    }
    private async selectGroupMenuItem(groupItemTitle: string){
        const groupMenuItem = this.page.getByTitle(groupItemTitle)
        const expandState = await groupMenuItem.getAttribute('area-expanded')
        if(expandState == 'false')
            await groupMenuItem.hover()
            await groupMenuItem.click()
    }
}