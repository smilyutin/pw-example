import {test, expect} from '@playwright/test'
import { time } from 'console';
    
test.beforeEach(async ({page}, testInfo) => {
    await page.goto(process.env.URL)
    await page.locator('a[href="/ajax"]').click();
    await page.getByText(`Button Triggering AJAX Request`).click()
    testInfo.setTimeout(testInfo.timeout + 10000); // increase timeout for this test 
})

test.skip(`auto waiting`, async ({page}) => {
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
test.skip(`alternative auto waiting`, async ({page}) => {
    test.slow()
    const successButton = page.locator(`.bg-success`)
    

    //       wait for element to be visible 
    // page.waitForSelector(`.bg-success`)

    //       wait for particular response
    //await page.waitForResponse(`http://uitestingplayground.com/ajax`)
    await successButton.click()

    //wait for network calls to be completed
    // await page.waitForLoadState('networkidle')
     // Wait for the AJAX response
    await page.waitForResponse(resp =>
    resp.url().includes('/ajaxdata') && resp.status() === 200
  );

  // Verify the success message appears
  const successMsg = page.locator('.bg-success');
  await expect(successMsg).toHaveText('Data loaded with AJAX get request.');
    
    // const text = await successButton.textContent()
    // expect(text).toContain(`Data loaded with AJAX get request.`)
})

test.skip(`timeout`, async ({page}) => {
    test.slow() // this will slow down the test execution
    const successButton = page.locator(`.bg-success`)
    await successButton.click()
    //       wait for element to be visible 
    //await page.waitForSelector(`.bg-succes`, {timeout: 1000}) // this will fail if the element is not visible in 1 second

    //       wait for particular response
    //await page.waitForResponse(`http://uitestingplayground.com/ajaxdata`, {timeout: 1000}) // this will fail if the response is not received in 1 second

    //wait for network calls to be completed
    // await page.waitForLoadState('networkidle', {timeout: 1000}) // this will fail if the network is not idle in 1 second

    await expect(successButton).toHaveText(`Data loaded with AJAX get request.`, {timeout: 1000})
})
