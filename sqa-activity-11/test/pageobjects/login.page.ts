import { $ } from '@wdio/globals';

class LoginPage {
  get menuButton() {
    return $('~open menu');
  }

  get loginMenuOption() {
    return $('~menu item log in');
  }

  get usernameInput() {
    return $('~Username input field');
  }

  get passwordInput() {
    return $('~Password input field');
  }

  get loginButton() {
    return $('~Login button');
  }

  get errorMessage() {
    return $('id=com.saucelabs.mydemoapp.rn:id/snackbar_text');
  }

  async openLoginForm(): Promise<void> {
    await this.menuButton.waitForDisplayed({ timeout: 10000 });
    await this.menuButton.click();
    await this.loginMenuOption.waitForDisplayed({ timeout: 10000 });
    await this.loginMenuOption.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.waitForDisplayed({ timeout: 10000 });
    await this.usernameInput.setValue(username);
    await this.passwordInput.setValue(password);
    await this.loginButton.click();
  }
}

export default new LoginPage();
