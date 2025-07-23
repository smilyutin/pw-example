import { test, expect} from '@playwright/test'
import { NavigationPage } from "../page-objects/navigationPage"
import { FormLayoutPage } from '../page-objects/formLayoutsPage'
import { DatePickerPage } from '../page-objects/datepickerPage'
import { PageManager } from '../page-objects/pageManager'


//npm run start to start the localhost
test.beforeEach(async({page}) => {
    await page.goto('http://localhost:4200/')
})

test('navigate to form page', async({page}) => {
    test.slow()
    const pm = new PageManager(page)
    // const navigateTo = new NavigationPage(page)
        await pm.navigateTo().datepickerPage()
        await pm.navigateTo().smartTablePage()
        await pm.navigateTo().toastrPage()
        await pm.navigateTo().tooltipPage()

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

