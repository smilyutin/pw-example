import { test, expect} from '@playwright/test'
import { NavigationPage } from "../page-objects/navigationPage"
import { FormLayoutPage } from '../page-objects/formLayoutsPage'
import { DatePickerPage } from '../page-objects/datepickerPage'


//npm run start to start the localhost
test.beforeEach(async({page}) => {
    await page.goto('http://localhost:4200/')
})

test('navigate to form page', async({page}) => {
    test.slow()
    const navigateTo = new NavigationPage(page)
        await navigateTo.formLayoutsPage()
        await navigateTo.datepickerPage()
        await navigateTo.smartTablePage()
        await navigateTo.toastrPage()
        await navigateTo.tooltipPage()

})


test('parametrized methods', async ({page}) => {
    const navigateTo = new NavigationPage(page)
    const onFormLayoutsPage = new FormLayoutPage(page)
    const onDatepickerPage = new DatePickerPage(page)

    await navigateTo.formLayoutsPage()
    await onFormLayoutsPage.submitUsingTheGridFormWithCredentialsAndSelectOption('test@test.ca','shoultc','Option 1')
    await onFormLayoutsPage.submitInLineFormWithNameEmailAndCheckbox('Jonny Smithy','jonny@shithy.ca', true)
    await navigateTo.datepickerPage()
    await onDatepickerPage.selectCommonDatePickerDateFromToday(5)
    await onDatepickerPage.selectDatepickerWithRangeFromToday(5,10)
})

