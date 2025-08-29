import {test, expect} from '@playwright/test'
import { tooltip } from 'leaflet'
import { using } from 'rxjs'
import { argosScreenshot } from "@argos-ci/playwright";

test.describe.configure({mode: 'parallel'})

test.beforeEach(async ({page}) => {
    await page.goto(`/`)
})

test.describe('Form layouts page', () => {
    test.describe.configure({retries: 2})
    test.describe.configure({mode: 'serial'})
    test.beforeEach(async ({page}) => {
        await page.getByText(`Forms`).click()
        await page.getByText(`Form Layouts`).click()
    })

    test(`input fields`, async ({page}, testInfo) => {
        if (testInfo.retry){
            //do something usefull 
        }
        const usingTheGridEmailInput = page.locator(`nb-card`, {hasText: "Using the Grid"}).getByRole(`textbox`, {name: "Email"})
    
        await usingTheGridEmailInput.fill(`hello@hell.ca`)
        await usingTheGridEmailInput.clear()
        await usingTheGridEmailInput.pressSequentially(`hshs@ha.ca`)//, {delay: 100}) // typing with delay

        //generic assertion
        const inputValue = await usingTheGridEmailInput.inputValue()
        expect(inputValue).toEqual(`hshs@ha.ca`)

        //locator assection
        await expect(usingTheGridEmailInput).toHaveValue(`hshs@ha.ca`)
    })

    test.skip(`radio buttons`, async ({page}) => {
            test.slow()
            const usingTheGridForm = page .locator(`nb-card`, {hasText: "Using the Grid"})

            await usingTheGridForm.getByLabel(`Option 1`).check({force: true})
            // await usingTheGridForm.getByRole(`radio`, {name: "Option 1"}).check({force: true})
            const radioStatus = await usingTheGridForm.getByRole(`radio`, {name: "Option 1"}).isChecked()
            expect(radioStatus).toBeTruthy()
            console.log(`Radio button status: ${radioStatus}`)
            await expect(usingTheGridForm.getByRole(`radio`, {name: "Option 1"})).toBeChecked()
//generic assertion
            await usingTheGridForm.getByRole(`radio`, {name:`Option 2`}).check({force: true})
            expect(await usingTheGridForm.getByRole(`radio`, {name: "Option 1"}).isChecked()).toBeFalsy()
            expect(await usingTheGridForm.getByRole(`radio`, {name: "Option 2"}).isChecked()).toBeTruthy()
           
    })
})

test(`checkboxes`, async ({page}) => {
    await page.getByText(`Modal & Overlays`).click()
    await page.getByText(`Toastr`).click()

    // await page.getByRole(`checkbox`, {name: "Hide on click"}).check({force: true})
    await page.getByRole(`checkbox`, {name: "Hide on click"}).uncheck({force: true})
    await page.getByRole(`checkbox`, {name: "Prevent arising of duplicate toast"}).check({force: true})

//locator for all checkboxes
    const allboxes = page.getByRole(`checkbox`)
    for(const boxes of await allboxes.all()) {
        // await boxes.check({force: true})
        // expect(await boxes.isChecked()).toBeTruthy()
        // console.log(`Checkbox status: ${await boxes.isChecked()}`)
        await boxes.uncheck({force: true})
        expect(await boxes.isChecked()).toBeFalsy()
                console.log(`Checkbox status: ${await boxes.isChecked()}`)
    }

})  

test (`list and dropdowns`, async ({page}) => {
    const dropDownMenu = page.locator(`ngx-header nb-select`)
    await dropDownMenu.click()

    page.getByRole(`list`) //when the list has a UL tag
    page.getByRole(`listitem`) //when the list has a LI tag

    // const listItems = page.getByRole(`list`).locator(`nb-option`)
    const optionList = page.locator(`nb-option-list nb-option`)
    await expect(optionList).toHaveCount(4) //asserting that the list has 5 items
    await expect(optionList).toHaveText(["Light", "Dark", "Cosmic", "Corporate"]) //asserting that the list has these items
    console.log(`List items: ${await optionList.allTextContents()}`) //printing list items to console
    await optionList.filter({hasText: "Cosmic"}).click() //clicking on the item with text "Cosmic"
    await expect(dropDownMenu).toHaveText(`Cosmic`) //asserting that the dropdown menu has text "Cosmic"
    console.log(`Dropdown menu text: ${await dropDownMenu.textContent()}`) //printing dropdown menu text to console
    const header = page.locator(`nb-layout-header`)
    await expect(header).toHaveCSS(`background-color`, `rgb(50, 50, 89)`) //asserting that the header has this background color
   // console.log(`Header background color: ${await header.evaluate(el => el.style.backgroundColor)}`) //printing header background color to console

   const colors = {
        "Light": "rgb(255, 255, 255)",
        "Dark": "rgb(34, 43, 69)",
        "Cosmic": "rgb(50, 50, 89)",
        "Corporate": "rgb(255, 255, 255)"
    }
    await dropDownMenu.click() //clicking on the dropdown menu to open it again
    for(const color in colors) {
        await optionList.filter({hasText: color}).click() //clicking on the item with text "Light", "Dark", "Cosmic" or "Corporate"
        await expect(header).toHaveCSS(`background-color`, colors[color]) //asserting that the header has this background color
        console.log(`Header background color for ${color} is: ${await dropDownMenu.textContent()}`) //printing header background color to console
        if (color !== "Corporate") {
            await dropDownMenu.click() //clicking on the dropdown menu to open it again
        }   
    }
})

test(`tooltip`, async ({page}) => {

    await page.getByText(`Modal & Overlays`).click()
    await page.getByText(`Tooltip`).click()

    const toolTipCard = page.locator(`nb-card`, {hasText: "Tooltip Placement"})
    await toolTipCard.getByRole(`button`, {name: `Top`}).hover() //hovering over the button with text "Top"

    page.getByRole(`tooltip`) //this will return the tooltip element
    const tooltip = await page.locator(`nb-tooltip`).textContent() //extracting tooltip text
    expect(tooltip).toEqual(`This is a tooltip`) //asserting that the tooltip
  
})

test(`dialog box`, async ({page}) => {
    await page.getByText(`Tables & Data`).click()
    await page.getByText(`Smart Table`).click()

    page.on('dialog', dialog => {
        expect(dialog.message()).toEqual(`Are you sure you want to delete?`) //asserting that the dialog type is alert
        dialog.accept() //accepting the dialog
    })
    await page.getByRole(`table`).locator(`tr`, {hasText: "mdo@gmail.com"}).locator('.nb-trash').click() //clicking on the delete button for the row with text "
    await expect(page.locator(`table tr`).first()).not.toHaveText(`mdo@gmail.com`)
})

test(`web tables`, async ({page}) => {
    await page.getByText(`Tables & Data`).click()
    await page.getByText(`Smart Table`).click()

    // get the row by any text in this row
    const targetRow = page.getByRole(`row`, {name: "twitter@outlook.com"})
    await targetRow.locator(`.nb-edit`).click() //clicking on the edit button for the row with text "
    await page.locator(`input-editor`).getByPlaceholder(`Age`).clear()
    await page.locator(`input-editor`).getByPlaceholder(`Age`).fill(`30`) //filling the age field with 30
   

    //get the row based on the value in the specific column
    await page.locator(`.ng2-smart-pagination-nav`).getByText(`2`).click() //clicking on the pagination button to go to the next page
    const targetRowById = page.getByRole(`row`, {name: "11"}).filter({has: page.locator(`td`).nth(1).getByText(`11`)})
    // await targetRowById.click() //clicking on the row with id 11
    await targetRowById.locator(`.nb-edit`).click() //clicking on the edit button for the row with id 11
    await page.locator(`input-editor`).getByPlaceholder(`E-mail`).clear()
    await page.locator(`input-editor`).getByPlaceholder(`E-mail`).fill(`koko@moo.ca`)
    await page.locator(`.nb-checkmark`).click() //clicking on the checkmark button to save the changes
    await expect(targetRowById.locator(`td`).nth(5)).toHaveText(`koko@moo.ca`)

    //test folter of the table
    const ages = ["20", "30", "40", "200"]

    for( let age of ages) {
        await page.locator(`input-filter`).getByPlaceholder(`Age`).clear()
        await page.locator(`input-filter`).getByPlaceholder(`Age`).fill(age)
        await page.waitForTimeout(1000) //wait for the table to be filtered
        const ageRows = page.locator(`tdbody tr`)

        for(let row of await ageRows.all()) {
        const sellValue = await row.locator(`td`).last().textContent() //getting the last cell value of the row
       
            if (age == "200"){
                expect(await page.getByRole(`table`).textContent()).toContain(`No data found`)//asserting that the last cell value
            } else {   
                expect(sellValue).toEqual(age) //asserting that the last cell value is equal to the age
            }
    
       }
    }
})

test(`datepicker`, async ({page}) => {
    test.slow() // this will slow down the test execution
    await page.getByText(`Forms`).click()
    await page.getByText(`Datepicker`).click()

    const calendarInputField = page.getByPlaceholder(`Form Picker`)
    await calendarInputField.click() //clicking on the calendar input field

    let date = new Date()
    date.setDate(date.getDate() + 730) //setting the date to tomorrow
    const expectedDate = date.getDate().toString()
    const expectedMonthShort = date.toLocaleString('En-US', { month: 'short' })
    const expectedMonthLong = date.toLocaleString('En-US', { month: 'long' })  //getting the month in short format
    const expectedYear = date.getFullYear()
    const dateToAssert = `${expectedMonthShort} ${expectedDate}, ${expectedYear}` //formatting the date to assert

    let calendarMonthAndYear = await page.locator(`nb-calendar-view-mode`).textContent()
    const expectedMonthAndYear = `${expectedMonthLong} ${expectedYear}` //getting the month and year from the calendar
    while(!calendarMonthAndYear.includes(expectedMonthAndYear)) { //looping until the calendar shows the expected month and year
        await page.locator(`nb-calendar-pageable-navigation [data-name="chevron-right"]`).click() //clicking on
        calendarMonthAndYear = await page.locator(`nb-calendar-view-mode`).textContent()
    }

    await page.locator(`[class="day-cell ng-star-inserted"]`).getByText(expectedDate, {exact: true}).click() //clicking on the day 15 in the calendar
    await expect(calendarInputField).toHaveValue(dateToAssert) //asserting that the calendar input field has the value we selected
    console.log(`Selected date is: ${await calendarInputField.inputValue()}`) //printing the selected date to console



})

test(`sliders`, async ({page}) => {
    // const tempGauge = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger circle')
    // await tempGauge.evaluate( node => {
    //     node.setAttribute(`cx`, `232.630`)
    //     node.setAttribute(`cy`, `232.630`)
    // })
    // await tempGauge.click()

    //mouse move
    const tempBox= page.locator('[tabtitle="Temperature"] ngx-temperature-dragger')
    await tempBox.scrollIntoViewIfNeeded() //scrolling the temperature box into view

    const box = await tempBox.boundingBox() //getting the bounding box of the temperature box
    const x = box.x + box.width / 2 //calculating the x coordinate of the center of the box
    const y = box.y + box.height / 2 //calculating the y coordinate of the center of the box
    await page.mouse.move(x, y) //moving the mouse to the center of the box     
    await page.mouse.down() //pressing the mouse down
    await page.mouse.move(x+100, y) //moving the mouse to the right by 100 pixels
    await page.mouse.move(x+100, y+100) //moving the mouse up by 100 pixels
    await page.mouse.up() //releasing the mouse
    await expect(tempBox).toContainText(`30`)


})