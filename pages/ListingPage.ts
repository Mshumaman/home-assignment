import {expect} from "@playwright/test";
import AirbnbMainPage from "./AirbnbMainPage";

export default class ListingPage extends AirbnbMainPage {
    private checkinDate = '[data-testid="change-dates-checkIn"]';
    private checkinOut = '[data-testid="change-dates-checkOut"]';
    private guests = '[data-testid="book-it-default"] ._j1kt73';
    private guestsPanel = '._r2ourjn';
    private closeGuestPanel = '[class="_r2ourjn"] [class*="p atm_9j"]'
    private closeTranslationPopup = '[class*="k_1tcgj5g dir dir-ltr"]';
    private guestDropdown = '[for="GuestPicker-book_it-trigger"]';
    private childCounter = "GuestPicker-book_it-form-children-stepper-value";
    private childDecreaseButton = '[data-testid="GuestPicker-book_it-form-children-stepper-decrease-button"]';
    private reserveButton = '[data-plugin-in-point-id="BOOK_IT_SIDEBAR"] [data-testid="homes-pdp-cta-btn"]';
    private clearDates = '[data-testid="inline-availability-calendar"] [class="_1sl8tba"]';
    private selectedDate = '[aria-label*="Selected"] div';
    private continueButton = '[data-testid="signup-login-submit-btn"]';


    public async closePopup() {
        await this.page.waitForLoadState('networkidle')
        const closePopup = this.page.locator(this.closeTranslationPopup);
        if(await closePopup.isVisible()){
            await closePopup.click();
        }

    }

    public async validateCheckinDate(checkinDate: string) {
        await this.validateTextContent(this.checkinDate, checkinDate);
    }


    public async validateCheckoutDate(checkinDate: string) {
        await this.validateTextContent(this.checkinOut, checkinDate);
    }


    public async validateNumberOfGuests(expectedNumberOfGuests: number) {
        const numberOfGuests = parseInt(await this.getTextContent(this.guests));
        expect(numberOfGuests).toEqual(expectedNumberOfGuests);
    }


    public async decreaseChildGuestToZero() {
        await this.page.locator(this.guestDropdown).click();
        let guestCount = await this.parseTextElementToNumber(this.page.getByTestId(this.childCounter));
        for (let i = 0; i < guestCount; i++) {
            await this.page.locator(this.childDecreaseButton).click();
            if (guestCount === 0) {
                break;
            }
        }
    }


    public async changeBookingDates(checkinOffset: number, checkoutOffset: number) {
        const selectedCheckinDate = await this.page.locator(this.selectedDate).first().getAttribute('data-testid');
        const selectedCheckoutDate = await this.page.locator(this.selectedDate).last().getAttribute('data-testid');

        let nextWeekDate = this.getDate(checkinOffset);
        let nextWeekDatePlusOne = this.getDate(checkoutOffset);

        const isDateAvailableAttribute = 'data-is-day-blocked';
        const nextWeekDateSwap = this.calendarDate.replace('date', nextWeekDate);
        const nextWeekDatePlusOneSwap = this.calendarDate.replace('date', nextWeekDatePlusOne);

        const isFirstDateBlocked = await this.page.getByTestId(nextWeekDateSwap).getAttribute(isDateAvailableAttribute);
        const isSecondDateBlocked = await this.page.getByTestId(nextWeekDatePlusOneSwap).getAttribute(isDateAvailableAttribute);

        if (isFirstDateBlocked === "true" || isSecondDateBlocked === "true") {
            console.log("Booking for next week isn't available");
        } else {
            // select check-in date
            await this.selectDate(nextWeekDate);
            // check if week plus 1 is blocked. If it does, retain old dates
            const isCheckoutBlocked = await this.page.getByTestId(nextWeekDatePlusOneSwap).getAttribute(isDateAvailableAttribute);
            const restriction = await this.page.locator(this.checkinOut).innerText();
            if(isCheckoutBlocked === "true" || restriction === 'Add date'){
                await this.page.locator(this.clearDates).click();
                await this.page.getByTestId(selectedCheckinDate).click();
                await this.page.getByTestId(selectedCheckoutDate).click();
                console.log("Some dates of next week aren't available. Retain old dates");
            } else {
                // select check-out date
                await this.selectDate(nextWeekDatePlusOne);
                // Format dates for validation
                const formattedCheckInDate = this.formatDateWithoutLeadingZero(nextWeekDate);
                const formattedCheckOutDate = this.formatDateWithoutLeadingZero(nextWeekDatePlusOne);
                // Validate new dates selected and displayed
                await this.validateCheckinDate(formattedCheckInDate);
                await this.validateCheckoutDate(formattedCheckOutDate);
            }
        }
    }

    public async clickReserve() {
        let guestPanelCount = await this.page.locator(this.guestsPanel).count() > 0;
        if (guestPanelCount) {
            await this.page.locator(this.closeGuestPanel).click();
        }
        await this.page.locator(this.reserveButton).click();
        await this.page.locator(this.continueButton).waitFor()
    }
}