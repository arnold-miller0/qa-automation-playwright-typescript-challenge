import { Page,  Locator} from 'playwright';
import { expect } from '@playwright/test';

import {SwagLabsBaseProdPage} from './baseProdPage';

export class SwagLabsLoginPage {

    private readonly page: Page;

    private _baseURL;

    private _baseProdPage;

    // locators
    private _titleLoc:Locator // Application Title

    private _usernameLoc:Locator // Login User

    private _passwordLoc:Locator // Login Password

    private _errorLoc:Locator // Login Error information
    private _errMsgLoc:Locator // sub-err field message
    private _errBtnLoc:Locator // sub-err field button

    private _loginBtnLoc:Locator // Login action either error or to Product Page

    // expected text fields
    private readonly _expTitleText:String;
    private readonly _expUserPlace:String;
    private readonly _expPassPlace:String;
    private readonly _expBtnText:String;

    constructor(page: Page, baseURL:String | undefined) {
        this.page = page;

        this._baseURL = baseURL;
        console.log(`URL - ${this._baseURL}`);

        // Locators
        this._titleLoc = this.page.locator('div.login_logo');
        this._usernameLoc = this.page.locator('input[data-test="username"]');
        this._passwordLoc = this.page.locator('input[data-test="password"]');
        this._errorLoc = this.page.locator('div[class*="error-message-container"]');
        this._errMsgLoc = this._errorLoc.locator('h3[data-test="error"]')
        this._errBtnLoc = this._errorLoc.locator('button[data-test="error-button"]')
        this._loginBtnLoc = this.page.locator('input[data-test="login-button"]');

        // expected text values
        this._expTitleText = "Swag Labs";
        this._expUserPlace = "Username";
        this._expPassPlace = "Password";
        this._expBtnText = "Login";

        this._baseProdPage = new SwagLabsBaseProdPage(page, baseURL);

    }
    async goto(debug?:boolean):Promise<void> {

        if (debug) console.log(`goto - ${this._baseURL}`);
        await this.page.goto(`${this._baseURL}`);

        const pageURL = this.page.url();
        expect(pageURL).toBe(this._baseURL);

        // wait to load page fields
        await this._titleLoc.isVisible();
        await this._usernameLoc.isVisible();
        await this._passwordLoc.isVisible();
        await this._errorLoc.isVisible();
        await this._loginBtnLoc.isVisible();

        await this.checkInitLoginFields();
     
    }

    async checkInitLoginFields():Promise<void> {
        // check page title text 
        const titleText:string = await this._titleLoc.innerText();
        expect(titleText).toBe(this._expTitleText);

        // check username placeholer
        const userPlaceText = await this._usernameLoc.getAttribute("placeholder")
        expect(userPlaceText).toBe(this._expUserPlace);

        // check password placeholder
        const passPlaceText = await this._passwordLoc.getAttribute("placeholder")
        expect(passPlaceText).toBe(this._expPassPlace);

        // check login button text
        const btnText = await this._loginBtnLoc.getAttribute("value")
        expect(btnText).toBe(this._expBtnText);
    }

    async inputUserValue(username:string):Promise<void> {
        await this._usernameLoc.fill(username);
        const userText = await this._usernameLoc.getAttribute("value")
        expect(userText).toBe(username);
    }

    async getUserValue():Promise<string> {
        let elemText: string | null = await this._usernameLoc.getAttribute("value");
        if (elemText === null) { elemText = '' }
        return elemText
    }

    async inputPassValue(password:string):Promise<void> {
        await this._passwordLoc.fill(password);

        const passText = await this._passwordLoc.getAttribute("value")
        expect(passText).toBe(password);
    }

    async getPassValue():Promise<string> {
        let elemText: string | null = await this._passwordLoc.getAttribute("value");
        if (elemText === null) { elemText = '' }
        return elemText
    }

    async loginAction(expErrMsg:String):Promise<Boolean> {
        const userValue = await this.getUserValue();
        console.log(`Login ${userValue} attempt`);
        await this._loginBtnLoc.click();

        // when expErrMsg is empty string 
        // then Login Success
        //  and on Invetory Page
        //  and return true
        if (expErrMsg === "") {
          
            const productURL:string = this.page.url();
            expect(productURL).toBe(`${this._baseURL}${this._baseProdPage.getInvtPathHtml()}`);
            console.log(`Login ${userValue} to Product-Invetory page`);
            return true;
        }
        // else Login Failure
        // check error message
        // return false
        await this._errMsgLoc.isVisible()
        const errMsgText = await this._errMsgLoc.innerText();
        expect(errMsgText).toBe(expErrMsg);
        console.log(`Login ${userValue} Error`);
        return false;
    }

}