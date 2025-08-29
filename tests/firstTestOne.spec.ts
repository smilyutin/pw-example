import {test, expect} from '@playwright/test'


// //hook to run before each test
test.beforeEach(async({page}) => {
    await page.goto(`/`)//
    await page.click(`text=Forms`)
    //await page.getByText(`Form Layouts`).click()
    await page.click(`text=Form Layouts`)
})

test(`locator sysntax rules`, async ({page}) => {
    //by Tag name
    await page.locator(`input`).first().click()

     //by ID
    await page.locator(`#inputEmail1`).click()

    //by Class
    page.locator(`.shape-rectangle`)

    //by Attribute
    page.locator(`[placeholder="Email"]`)   

    //by Class value (full)
    page.locator('[class="input-full-width size-medium status-basic shape-rectangle nb-transition"]')

    //combination of Class and Attribute
    page.locator(`input[placeholder="Email"][nbinput]`)
    
    // by XPath not recomended to all playwright good people
    page.locator(`//*[@id="inputEmail"]`)

    //by partial text
    page.locator(`:text("Using")`)

    //by exact text match
    page.locator(`:text-is("Using the Grid")`)
})

test(`User facing locators`, async ({page}) => {
    //by Label 
    await page.getByRole('textbox',{name:"Email"}).first().click()

    await page.getByRole('button',{name:"Sign in"}).first().click()

    await page.getByLabel('Email').first().click()  

    await page.getByPlaceholder(`Jane Doe`).click() 

    await page.getByText(`Using the Grid`).click()

    await page.getByTestId(`SignIn`).click()
    console.log('SignIn button clicked')

    //await page.getByTitle(`Iot Dashboard`).click()



    // //by Text
    // await page.locator(`text=Email`).click()

    // //by Placeholder
    // await page.locator(`input[placeholder="Email"]`).click()

    // //by Role
    // await page.locator(`role=button[name="Submit"]`).click()
})  

test(`Locating child elements`, async ({page}) => {
    await page.locator(`nb-card nb-radio :text-is("Option 1")`).click()
    await page.locator(`nb-card`).locator(`nb-radio`).locator(`:text-is("Option 2")`).click() //locator chaining

    await page.locator(`nb-card`).getByRole(`button`, {name: "Sign in"}).first().click()// locator chaining

    await page.locator(`nb-card`).nth(3).getByRole(`button`).click() // try not to use it
})

test('Locating parent elements', async ({page}) => {
    await page.locator(`nb-card`,{hasText: "Using the Grid"}).getByRole('textbox', {name: "Email"}).click()
    await page.locator(`nb-card`,{has: page.locator(`#inputEmail1`)}).getByRole('textbox', {name: "Email"}).click()
    await page.locator(`nb-card`).filter({hasText: "Basic form"}).getByRole('textbox', {name: "Email"}).click() // this is not working, need to fix it
    await page.locator(`nb-card`).filter({has: page.locator(`.status-danger`)}).getByRole('textbox', {name: "Password"}).click()
    await page.locator(`nb-card`).filter({has: page.locator(`nb-checkbox`)}).filter({hasText: "Sign in"})
        .getByRole('textbox', {name: "Email"}).click()
    await page.locator(`:text-is("Using the Grid")`).locator(`..`).getByRole('textbox', {name: "Email"}).click()
}) 

test(`Reusing locators`, async ({page}) => {
    const basicForm = page.locator(`nb-card`).filter({hasText: "Basic form"}) //assigning locator to a basicForm
    const emailField = basicForm.getByRole('textbox', {name: "Email"}) //reusing locator
    
    //await basicForm.getByRole('textbox', {name: "Email"}).fill(`email@mail.com`) // using basicForm locator to find child element
    await emailField.fill(`email@mail.com`)
    await basicForm.getByRole('textbox', {name: "Password"}).fill(`Hello1234`)
    await basicForm.locator('nb-checkbox').click()
    await basicForm.getByRole('button', {name: "Submit"}).click()

    await expect(emailField).toHaveValue(`email@mail.com`) //asserting that the email field has the value we filled
    //await expect(basicForm).toHaveText(`Password`)
})

test(`Extract button name`, async ({page}) => {
    //single text value
    const basicForm = page.locator(`nb-card`).filter({hasText: "Basic form"}) //assigning locator to a basicForm
    const buttonText = await basicForm.locator(`button`).textContent() //extracting button text
    expect(buttonText).toEqual(`Submit`) //asserting that the button text is equal
    console.log(`Button text is: ${buttonText}`) //printing button text to console

    //all text values
    const allRadioButtons = await page.locator(`nb-radio`).allTextContents() //extracting all radio button texts
    expect(allRadioButtons).toContain(`Option 1`) //asserting that the array of radio button texts contains "Option 1"
    console.log(`All radio buttons text: ${allRadioButtons}`) //printing all radio button texts to console

    //getting input value
    const emailField = basicForm.getByRole('textbox', {name: "Email"}) //reusing locator
    await emailField.fill(`test@name.com`)
    const emailValue = await emailField.inputValue() //extracting input value
    expect(emailValue).toEqual(`test@name.com`)
    console.log(`Email field value is: ${emailValue}`) //printing email field value to console
//getting value of attribute 
    const placeholderValue = await emailField.getAttribute(`placeholder`) //extracting placeholder value
    expect(placeholderValue).toEqual(`Email`) //asserting that the placeholder value is


})    


test (`assertions`, async ({page}) => {
    const basicFormButton = page.locator(`nb-card`).filter({hasText: "Basic form"}).locator(`button`)
    //general assertions
    const value = 5
    expect(value).toEqual(5) //asserting that value is equal to 5

    const text = await basicFormButton.textContent() //extracting button text
    expect(text).toEqual(`Submit`) //asserting that the button text contains "Submit

    //locator assertions
    await expect(basicFormButton).toHaveText(`Submit`) //asserting that the button text is equal to "Submit"

    //soft assertions
   // await expect.soft(basicFormButton).toHaveText(`Submito`) //asserting  
    await basicFormButton.click() //this will not fail the test if the assertion fails
    console.log(`This is soft assertion, it will not fail the test if the assertion fails`)

})