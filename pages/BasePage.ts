import {expect, Locator, Page} from "@playwright/test";

export default class BasePage {

    constructor(public page: Page) {
    }


    public async loadApplication(url: string) {
        await this.page.goto(url);
    }


    public async validateUrl(url: string) {
        expect(this.page.url()).toContain(url);
    }


    public async selectFromDropdown(dropdownElement: string, value: string) {
        const dropDownOptions = await this.page.locator(dropdownElement).all();
        for (let dropdownOption of dropDownOptions) {
            const optionText = await dropdownOption.innerText();
            if (optionText.trim() === value) {
                await dropdownOption.click();
                return;
            }
        }
    }


    public async validateTextContent(element: string, expectedText: string) {
        const locator = this.page.locator(element);
        await expect(locator).toContainText(expectedText);
    }


    public async getTextContent(element: string) {
        return await this.page.locator(element).textContent();
    }

    /**
     * Generates a date string for a specified day relative to the current date.
     * @param {number} [extraDay=0] - The number of additional days to add to the current date.
     * @returns {string} - A date string in the format "MM/DD/YYYY" representing the specified day.
     */

    public getDate(extraDay: number = 0): string {
        const currentDate = new Date();
        const tomorrowDate = new Date(currentDate);
        tomorrowDate.setDate(currentDate.getDate() + extraDay);
        const month = (tomorrowDate.getMonth() + 1).toString().padStart(2, '0');
        const day = tomorrowDate.getDate().toString().padStart(2, '0');
        const year = tomorrowDate.getFullYear().toString();
        return `${month}/${day}/${year}`;
    }

    public formatDateWithoutLeadingZero(dateString: string) {
        let parsedDate = new Date(dateString);
        return parsedDate.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
    }

    public async parseTextElementToNumber(element : Locator) {
        return parseInt(await element.textContent());
    }
}