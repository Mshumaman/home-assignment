import BasePage from "./BasePage";
import {expect, Locator} from "@playwright/test";

export enum guestEnum {
    ADULTS = 'adults',
    CHILDREN = 'children',
    INFANTS = 'infants',
    PETS = 'pets'
}

export default class AirbnbMainPage extends BasePage {
    private destinationText = 'structured-search-input-field-query';
    private destinationOptions = '[data-testid*="option-"]';
    protected calendarDate = 'calendar-day-date';
    private addGuestsField = '[data-testid*="guests-button"]';
    private guestPanel = 'structured-search-input-field-guests-panel';
    private search = "structured-search-input-search-button";
    private results = '.tyi4kqb';
    private listingRating = '.ru0q88m:not(.fp93bgd .ru0q88m)';
    private guestsInSearchPanel = '[class$="ltr"][data-index="2"] .f16sug5q';


    public async selectDestination(destination: string): Promise<void> {
        let destinationField = this.page.getByTestId(this.destinationText);
        await destinationField.waitFor();
        await destinationField.pressSequentially(destination, {delay: 80}); //Delay added to allow time for the results to appear in the drop-down
        await this.selectFromDropdown(this.destinationOptions, destination);
    }


    public async selectDate(date: string) {
        const dateSwapTomorrow = this.calendarDate.replace('date', date)
        await this.page.getByTestId(dateSwapTomorrow).click();
    }


    public async selectGuests(guestType: guestEnum, guestNumber: number) {
        let guestPanelCount = await this.page.getByTestId(this.guestPanel).count() < 1;
        if (guestPanelCount) {
            await this.page.locator(this.addGuestsField).click();
        }
        let guestCount = parseInt(await this.page.locator(`[data-testid="stepper-${guestType}-value"]`).textContent());
        for (let i = 0; i < guestNumber; i++) {
            await this.page.locator(`[data-testid="stepper-${guestType}-increase-button"]`).click();
            if (guestCount === guestNumber) {
                break;
            }
        }
    }

    public async clickSearch() {
        await this.page.getByTestId(this.search).click();
    }


    public async validateSearchResultsCount() {
        // Validate that the number of results is greater than 0
        await expect.poll(async () => {
            return parseInt(await this.page.locator(this.results).textContent())
        }, {
            timeout: 15000
        }).toBeGreaterThan(0);
    }

    public async validateSearchResultsText(expectedResult: string) {
        // Validate that the result's text is correct
        await this.validateTextContent(this.results, expectedResult)
    }

    public async getNumberOfGuests() {
        return await this.getTextContent(this.guestsInSearchPanel);
    }

    /**
     * Selects the highest-rated listing from a list of listings.
     * This function iterates through all the elements containing listing ratings on the page.
     * It compares the ratings of each listing to find the highest-rated one.
     * Once the highest-rated listing is identified, it clicks on it to open it in a new tab.
     */

    public async selectHighestRatedListing() {
        let highestRating = 0;
        let highestRatedElement: Locator;
        await this.page.locator(this.listingRating).nth(3).locator('visible=true').waitFor()
        const ratingElements = await this.page.locator(this.listingRating).all();
        for (const element of ratingElements) {
            const ratingText = await element.innerText();
            const rating = parseFloat(ratingText);
            if (rating > highestRating) {
                highestRatedElement = element;
                highestRating = rating;
            }
        }
        // If the highest rated element is found, click on it to open the listing in a new tab
        if (highestRatedElement) {
            const [newTab] = await Promise.all([
                this.page.waitForEvent('popup'),
                await highestRatedElement.first().locator('visible=true').click({force: true})
            ]);
            return newTab;
        } else {
            throw new Error('No elements found with the specified class');
        }
    }
}
