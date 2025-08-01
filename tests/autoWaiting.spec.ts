import {test, expect} from '@playwright/test'
import { time } from 'console';
    
test.beforeEach(async ({page}, testInfo) => {
    await page.goto(`http://uitestingplayground.com/`)
    await page.locator('a[href="/ajax"]').click();
    await page.getByText(`Button Triggering AJAX Request`).click()
    testInfo.setTimeout(testInfo.timeout + 10000); // increase timeout for this test 
})

test(`auto waiting`, async ({page}) => {
    const successButton = page.locator(`.bg-succes`)
    // await successButton.waitFor({state: 'visible'})
    // await successButton.click()

    //const text = await successButton.textContent()
    // await successButton.waitFor({state: 'attached'})
    // const text = await successButton.allTextContents()

    //expect(text).toContain(`Data loaded with AJAX get request.`)

    await expect(successButton).toHaveText(`Data loaded with AJAX get request.`, {timeout: 30000})

})


//       wait for element to be visible 
test(`alternative auto waiting`, async ({page}) => {
    const successButton = page.locator(`.bg-succes`)

    //       wait for element to be visible 
    //await page.waitForSelector(`.bg-succes`)

    //       wait for particular response
    //await page.waitForResponse(`http://uitestingplayground.com/ajaxdata`)

    //wait for network calls to be completed
    // await page.waitForLoadState('networkidle')

    
    const text = await successButton.allTextContents
    expect(text).toContain(`Data loaded with AJAX get request.`)
})

test(`timeout)`, async ({page}) => {
    test.slow() // this will slow down the test execution
    const successButton = page.locator(`.bg-succes`)
    await successButton.click()
    //       wait for element to be visible 
    //await page.waitForSelector(`.bg-succes`, {timeout: 1000}) // this will fail if the element is not visible in 1 second

    //       wait for particular response
    //await page.waitForResponse(`http://uitestingplayground.com/ajaxdata`, {timeout: 1000}) // this will fail if the response is not received in 1 second

    //wait for network calls to be completed
    // await page.waitForLoadState('networkidle', {timeout: 1000}) // this will fail if the network is not idle in 1 second

    await expect(successButton).toHaveText(`Data loaded with AJAX get request.`, {timeout: 1000})
})
