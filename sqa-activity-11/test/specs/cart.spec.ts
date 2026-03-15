import { expect } from '@wdio/globals';
import productsPage from '../pageobjects/products.page';

describe('Actividad 11 - Pruebas de carrito', () => {
  it('permite agregar un producto al carrito', async () => {
    await productsPage.addFirstProductToCart();
    await expect(productsPage.cartBadge).toBeDisplayed();
  });

  it('permite navegar hacia el carrito', async () => {
    await productsPage.openCart();
    await expect(productsPage.checkoutButton).toBeExisting();
  });
});
