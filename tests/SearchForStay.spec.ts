import {expect, test} from "@playwright/test";
import BasePage from "../pages/BasePage";
import AirbnbMainPage, {guestEnum} from "../pages/AirbnbMainPage";
import {Destination} from "../helpers/Destinations";


test.describe('Search for a stay', () => {

    let basePage: BasePage;
    let airbnbPage: AirbnbMainPage;
    const destination = Destination
    const numberOfAdults = 2;
    const numberOfChildren = 1;
    let tomorrowDate: string;
    let dayAfterTomorrowDate: string;
    let numberOfGuests: number;


    test('Search for a listing in airbnb and validate results', async ({page}) => {

        basePage = new BasePage(page);
        airbnbPage = new AirbnbMainPage(page);

        await test.step('Navigate to airbnb', async () => {
            await basePage.loadApplication('/');

        })
        await test.step(`Select destination: ${destination} `, async () => {
            await airbnbPage.selectDestination(destination);
        })

        await test.step('Select tomorrow date as check-in and day after tomorrow for check-out', async () => {
            tomorrowDate = basePage.getDate(1);
            dayAfterTomorrowDate = basePage.getDate(2);
            await airbnbPage.selectDate(tomorrowDate);
            await airbnbPage.selectDate(dayAfterTomorrowDate);
        })

        await test.step('Select 2 adults and 1 child as number guests', async () => {
            await airbnbPage.selectGuests(guestEnum.ADULTS, numberOfAdults);
            await airbnbPage.selectGuests(guestEnum.CHILDREN, numberOfChildren);
        })

        await test.step('Search and validate results count is greater than 0 and validate results title', async () => {
            await airbnbPage.clickSearch();
            await airbnbPage.validateSearchResultsCount();
            await airbnbPage.validateResultsTitle();
        })
        await test.step('validate the number of guests', async () => {
            numberOfGuests = parseInt(await airbnbPage.getNumberOfGuests());
            expect(numberOfGuests).toEqual(numberOfAdults + numberOfChildren);
        })
    })
});
