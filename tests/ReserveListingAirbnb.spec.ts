import {expect, Page, test} from "@playwright/test";
import BasePage from "../pages/BasePage";
import AirbnbMainPage, {guestEnum} from "../pages/AirbnbMainPage";
import ConfirmationPage from "../pages/ConfirmationPage";
import {Destination} from "../helpers/Destinations";
import ListingPage from "../pages/ListingPage";
import {AIRBNB_BASE_URL} from "../helpers/Environment";


test.describe('Reserving an Airbnb Listing', () => {

    let basePage: BasePage;
    let airbnbPage: AirbnbMainPage;
    let listingPage: ListingPage;
    let confirmationPage: ConfirmationPage;
    let newTab: Page;
    const destination = Destination;
    const numberOfAdults = 2;
    const numberOfChildren = 1;
    let tomorrowDate: string;
    let dayAfterTomorrowDate: string;
    let numberOfGuests: number;


    test('End-to-End Test: Reserving the Highest Rated Airbnb Listing in Amsterdam and Validating Selected Details', async ({page}) => {

        basePage = new BasePage(page);
        airbnbPage = new AirbnbMainPage(page);
        listingPage = new ListingPage(page)

        await test.step('Navigate to airbnb', async () => {
            await basePage.loadApplication(AIRBNB_BASE_URL);

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
            expect(numberOfGuests).toEqual(numberOfChildren + numberOfAdults);
        })

        await test.step('Select the highest Rated listing', async () => {
            newTab = await airbnbPage.selectHighestRatedListing();
        })

        await test.step('Confirm Booking Details', async () => {
            listingPage = new ListingPage(newTab);
            const formattedCheckInDate = basePage.formatDateWithoutLeadingZero(tomorrowDate);
            const formattedCheckOutDate = basePage.formatDateWithoutLeadingZero(dayAfterTomorrowDate);
            await listingPage.closePopup();
            await listingPage.validateCheckinDate(formattedCheckInDate);
            await listingPage.validateCheckoutDate(formattedCheckOutDate);
            await listingPage.validateNumberOfGuests(numberOfGuests);

        })

        await test.step('Decrease the number of child guests to 0 and validate that the guest count updates correctly', async () => {
            await listingPage.decreaseChildGuestToZero();
            await listingPage.validateNumberOfGuests(numberOfGuests - 1);
        })

        await test.step('Change booking dates to a week from the current date. ', async () => {
            await listingPage.changeBookingDates(8, 9);
        })

        await test.step('Reserve and validate URL include the accurate number of adults', async () => {
            await listingPage.clickReserve();
            confirmationPage = new ConfirmationPage(newTab);
            await confirmationPage.validateReservationUrl('/book/stays/');
            await confirmationPage.validateReservationUrl(`numberOfAdults=${numberOfAdults}`);
        })
    })
});
