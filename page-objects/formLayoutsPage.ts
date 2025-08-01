import { Page } from '@playwright/test'
import { HelperBase } from './helperBase'



export class FormLayoutPage extends HelperBase {

    constructor(page: Page) {
    super(page);  
    }

    /**
     * 
     * @param email 
     * @param password 
     * @param optionText 
     */
    async submitUsingTheGridFormWithCredentialsAndSelectOption(email:string, password:string,optionText:string){
        const usingTheGridForm = this.page .locator(`nb-card`, {hasText: "Using the Grid"})
        await usingTheGridForm.getByRole(`textbox`, {name: "Email"}).fill(email)
        await usingTheGridForm.getByRole(`textbox`, {name: "Password"}).fill(password)
        await usingTheGridForm.getByRole(`radio`, {name: optionText}).check({force: true})
        await usingTheGridForm.getByRole('button').click()

    }

    /**
     * 
     * @param name 
     * @param email 
     * @param rememberMe 
     */
    async submitInLineFormWithNameEmailAndCheckbox(name:string, email:string,rememberMe: boolean){
        const inlineForm = this.page .locator(`nb-card`, {hasText: "Inline form"})
        await inlineForm.getByRole(`textbox`, {name: "Jane Doe"}).fill(name)
        await inlineForm.getByRole(`textbox`, {name: "Email"}).fill(email)
        if(rememberMe)
            await inlineForm.getByRole(`checkbox`).check({force: true})
        await inlineForm.getByRole('button').click()
    }

}