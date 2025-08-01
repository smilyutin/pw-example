import {test} from '@playwright/test'


//hook to run before each test
test.beforeEach(async({page}) => {
    await page.goto(`/`)//
    // await page.click(`text=Forms`)
    // await page.getByText(`Forms~).click()`)
})
//
test.describe('forms access',() => { // this will skip this test
    test.beforeEach(async ({page}) => {
        await page.click(`text=Forms`)
    })
    test(`navigate to froms layouts page`, async ({page}) => {
        await page.click(`text=Form Layouts`)
    })
    test(`navigate to datepicker page`, async ({page}) => {
        await page.click(`text=Datepicker`)
    })
 })

test.describe('charts access',() => {// this will run only this test
    test.beforeEach(async ({page}) => {
        await page.click(`text=Charts`)
    })
    test(`navigate to echarts`, async ({page}) => {
        await page.click(`text=Echarts`)
    })
 })
 
test.describe('modal & ovelay access',() => {// this will run only this test
    test.beforeEach(async ({page}) => {
        await page.click(`text=Modal & Overlay`)
    })
    test(`navigate to dialog`, async ({page}) => {
        await page.click(`text=Dialog`)
    })
    test(`navigate to window page`, async ({page}) => {
        await page.click(`text=Window`)
    })
    test(`navigate to tooltip page`, async ({page}) => {
        await page.click(`text=Tooltip`)
    })
 })

 test.describe('extra components access',() => {// this will run only this test
    test.beforeEach(async ({page}) => {
        await page.click(`text=Extra Components`)
    })
    test(`navigate to calendar`, async ({page}) => {
        await page.click(`text=Calendar`)
    })
 })

 test.describe('tables & data access',() => {// this will run only this test
    test.beforeEach(async ({page}) => {
        await page.click(`text=Tables & Data`)
    })
    test(`navigate to smart table`, async ({page}) => {
        await page.click(`text=Smart Table`)
    })
    test(`navigate to tree greed page`, async ({page}) => {
        await page.click(`text=Tree Grid`)
    })
 })