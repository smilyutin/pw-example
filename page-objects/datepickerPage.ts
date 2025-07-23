import { Page, expect } from '@playwright/test'

export class DatePickerPage{

    private readonly page: Page

    constructor(page: Page){
        this.page = page
    }

    /**
     * 
     * @param numberOfDaysFromToday 
     */
    async selectCommonDatePickerDateFromToday(numberOfDaysFromToday: number){
        const calendarInputField = this.page.getByPlaceholder(`Form Picker`)
        await calendarInputField.click() //clicking on the calendar input field
        const dateToAssert = await this.selectDateInTheCalendar(numberOfDaysFromToday)
        await expect(calendarInputField).toHaveValue(dateToAssert)     
    }

    /**
     * 
     * @param startDayFromToday 
     * @param endDayFromToday 
     */
    async selectDatepickerWithRangeFromToday(startDayFromToday: number, endDayFromToday: number){
        const calendarInputField = this.page.getByPlaceholder('Range Picker')
        await calendarInputField.click()
        const dateToAssertStart = await this.selectDateInTheCalendar(startDayFromToday)
        const dateToAssertEnd = await this.selectDateInTheCalendar(endDayFromToday)
        const dateToAssert = `${dateToAssertStart} - ${dateToAssertEnd}`
        await expect(calendarInputField).toHaveValue(dateToAssert)
    }

    /**
     * 
     * @param numberOfDaysFromToday 
     * @returns 
     */
    private async selectDateInTheCalendar(numberOfDaysFromToday: number){
         let date = new Date()
            date.setDate(date.getDate() + numberOfDaysFromToday) //setting the date to tomorrow
            const expectedDate = date.getDate().toString()
            const expectedMonthShort = date.toLocaleString('En-US', { month: 'short' })
            const expectedMonthLong = date.toLocaleString('En-US', { month: 'long' })  //getting the month in short format
            const expectedYear = date.getFullYear()
            const dateToAssert = `${expectedMonthShort} ${expectedDate}, ${expectedYear}` //formatting the date to assert
        
            let calendarMonthAndYear = await this.page.locator(`nb-calendar-view-mode`).textContent()
            const expectedMonthAndYear = `${expectedMonthLong} ${expectedYear}` //getting the month and year from the calendar
            while(!calendarMonthAndYear.includes(expectedMonthAndYear)) { //looping until the calendar shows the expected month and year
                await this.page.locator(`nb-calendar-pageable-navigation [data-name="chevron-right"]`).click() //clicking on
                calendarMonthAndYear = await this.page.locator(`nb-calendar-view-mode`).textContent()
            }
            await this.page.locator(`.day-cell.ng-star-inserted`).getByText(expectedDate, {exact: true}).first().click() //clicking on the day 15 in the calendar

            const matchingDays = await this.page.locator(`.day-cell.ng-star-inserted`).getByText(expectedDate, { exact: true });
            console.log(`Found ${await matchingDays.count()} day(s) matching "${expectedDate}"`);

            //await this.page.locator(`.day-cell.ng-star-inserted`).getByText(expectedDate, {exact: true}).first().click() //clicking on the day 15 in the calendar
            return dateToAssert


    }
}