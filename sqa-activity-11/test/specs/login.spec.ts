import { expect } from '@wdio/globals';
import loginPage from '../pageobjects/login.page';
import { users } from '../../utils/test-data';

describe('Actividad 11 - Pruebas de login', () => {
  it('permite intentar login con credenciales invalidas', async () => {
    await loginPage.openLoginForm();
    await loginPage.login(users.invalid.username, users.invalid.password);
    await expect(loginPage.errorMessage).toBeDisplayed();
  });

  it('permite completar el formulario de login', async () => {
    await loginPage.openLoginForm();
    await loginPage.login(users.valid.username, users.valid.password);
    await expect(loginPage.loginButton).toBeExisting();
  });
});
